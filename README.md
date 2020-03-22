# Dotssm

![Tests](https://github.com/RaniSputnik/dotssm/workflows/Tests/badge.svg)

[Dotenv](https://www.npmjs.com/package/dotenv) for [SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
Load configuration from a file when running locally,
seamlessly integrate with SSM when running in an AWS environment.

## Usage

A simple example, say you have a value in parameter store `/mydomain/myapp/name`.

Add a `.ssm.json` file to your local repo with the following contents:

```json
{
  "/mydomain/myapp/name": "Some Cool App (Dev)"
}
```

Use the following code in your app to retrieve the config:

```js
import { getConfig } from "dotssm";

const namespace = "/mydomain/myapp/";
const config = await getConfig(namespace);
const appName = config.name;
```

Exclude the `.ssm.json` file from your deployment pacakge and the config
will seamlessly be loaded from AWS Systems Manager instead.

The client making the above request requires the following IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParametersByPath"],
      "Resource": "arn:aws:ssm:region:account-id:parameter/mydomain/myapp/*"
    }
  ]
}
```

And that's all there is to it.
You can now develop locally offline and seamlessly integrate with SSM once deployed.

## Advanced Usage

### Custom AWS Client

If you would like to use a customised AWS client to retrieve values from SSM, you can use the `withAWSClient` method.
Returns a `getConfig` function that will use the AWS client provided when fetching from a live environment.

```js
import { withAWSClient } from "dotssm";
import AWS from "aws-sdk";

const client = AWS.SSM({ apiVersion: "2014-11-06" });
const getConfig = withAWSClient(client);
const config = await getConfig("/mydomain/myapp/");

// TODO: Do something with config
```

### Caching

It is possible to use an in-memory cache to avoid multiple expensive fetches from SSM.
This is particularly useful in a Lambda environment where you may want to ensure you only fetch config once per invocation.

```js
import { withCache } from "dotssm";
import { serviceA, serviceB } from "./my/domain";

export async function myLambdaHandler(event, context) {
  const getConfig = withCache();
  await serviceA(getConfig);
  await serviceB(getConfig);
  // The first call to getConfig will fetch from SSM
  // Everything thereafter will use the cached result
}
```

### Validation

The above config fetching functions return a record which allows you to retrieve values by name.
In many circumstances it is useful to validate the config once retrieved so that you can be sure
the required parameters are present.
This has the additional benefit of providing stronger typing when using Typescript.

An advanced validation case might look like the following:

```js
import { withValidation } from "dotssm";

const validateMyConfig = v => {
  const config = {
    api: {
      url: v.required("/api/url", urlFormat),
      token: v.required("/api/token", minLength(5))
    },
    maxUsers: parseInt(v.optional("/maxUsers")) || 0
  };
  if (config.api.url.contains("localhost")) {
    v.error("/api/url", "Can not use local API for some good reason");
  }
  return config;
};

const getConfig = withValidation(validateMyConfig);
const config = await getConfig("/mydomain/myapp");
console.log(config.api); // Logs { url: "http://example.com", "token": "abc123" }
```

The magic is all in the validator function (`validateMyConfig`), which is passed a validator (`v`) with three methods:

- `v.required(param, ...constraints)` - indicates that a given parameter is required.
- `v.optional(param, ...constraints)` - indicates that a given parameter is optional.
- `v.error(param, message)` - allows the reporting of domain specific errors.

The validation function is run when `getConfig` is called and any validation errors result in a
thrown error with an aggregated list of validation failures.

You can also combine validation with caching and custom AWS clients as follows:

```js
import { withAWSClient, withValidation, withCache } from "dotssm";

const getConfig = withCache(
  withValidation(validateMyConfig, withAWSClient(myClient))
);
```

_Note: The order is important here. If we were to put `withCache` inside the `withValidation` function,
validation would be re-run despite the fact that no new config was being retrieved._

## Full API Reference

```typescript
// Get configuration either from a local .ssm.json file or from SSM
function getConfig(namespace: string): Promise<Config>;
// Add a custom AWS client for fetching from SSM
function withAWSClient(client: AWS.SSM): GetConfigFunc<Config>;
// Add cache support to ensure config is only retrieved once from SSM
function withCache(): GetConfigFunc<Config>;
function withCache<T>(getConfig: GetConfigFunc<T>): GetConfigFunc<T>;
// Add validation support to ensure your config matches your expectations
function withValidation<T>((v: Validator): T): GetConfigFunc<T>;
function withValidation<T>((v: Validator): T, getConfig: GetConfigFunc): GetConfigFunc<T>;

// A validator is passed to validation functions to allow them to report errors
class Validator {
  required(param: string, ...constraint: Constraint[]): string
  optional(param: string, ...constraint: Constraint[]): string | undefined
  error(param: string, message: string): void
}

interface ValidationError { name: string, error: string };
type Constraint = (value: string): ValidationError | undefined;
type Config = Record<string, string | undefined>
type GetConfigFunc<T> = (namespace: string): Promise<T>
```

## Motivation

This package is premised on the following three opinions:

1. SSM is the best place to put config
2. Having branching application code for config is a smell
3. Running offline is essential to local development

If you agree with these premises, then there's a good chance
this package is for you. If you're not sure you agree with these
premises then read on.

### 1. SSM is a good place to put config

First off, what is config?
The [12 factor app](https://12factor.net/config) succinctly describes it as:

> An app’s config is everything that is likely to vary between deploys (staging, production, developer environments, etc). This includes:
>
> - Resource handles to the database, Memcached, and other backing services
> - Credentials to external services such as Amazon S3 or Twitter
> - Per-deploy values such as the canonical hostname for the deploy

There are a number of options for storing application config in AWS.
An obvious place for storing application config is environment variables
but it can be difficult to store secrets securely in environment variables
particularly when using Lambda (which makes those environement variables
visible in the console).

So then perhaps you could put config in environment variables and secrets
in SSM or secrets manager but then you have two different stories for what
happens when config changes (changing an env var triggers a cold start for
Lambda whereas SSM and secrets manager will change silently) which can be
very confusing if you cache any config.

So if you want all your configuration in one place and environment variables
won't do, why not secrets manager? Secrets manager is actually rather sophisticated
and has a number of interesting (but difficult to reason about) key rotation features.
We have found SSM to have the right level of sophistication to simplicity rather
than being bogged down by a feature set that's too complex for most common use cases.

### 2. Having branching application code for config is a smell

If you different config sources between your local machine and a deployed
environmnet, that can occassionally mean adding branching logic to your application
code, just to ensure config is read from the corrrect place!
This code is often hard to understand for newcomers to a codebase and can cause
misinterpretations of what is _actually_ happening when the system is run.

Moving this branching logic out of your application code and making it more _tactile_
(if a `.ssm.json` file is present, read it, else go direct to SSM) makes the code
much easier to reason about and makes misunderstandings far less likely to occur.

### 3. Running offline is essential to local development

When developing locally, it's a pain to be logged in to an environment.
You should be able to develop your applications entirely offline to ensure
a quick feedback cycle and speed of development.
A local config file allows you to do this.

## FAQ

### You mention AWS Lambda a bunch, is this package only useful if I'm using Lambda?

No! Though you may want to closely evaluate whether SSM is the best place
for you to put your application config. We certainly found that for Lambda
but that might not be true of your setup.

### How do I contribute to the development of this package?

Please read the [contribution guidelines](CONTRIBUTING.md).
