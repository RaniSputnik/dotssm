# Dotssm

[Dotenv](https://www.npmjs.com/package/dotenv) for [SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
Load configuration from a file when running locally,
seamlessly integrate with SSM when running in an AWS environment.

## Usage

A simple example, say you have a value in parameter store `/mydomain/myapp/name`.

Add a `.ssm.json` file to your local repo with the following contents:

```json
{
  "mydomain": {
    "myapp": {
      "name": "Some Cool App (Dev)"
    }
  }
}
```

Use the following code in your app to retrieve the config:

```js
import { getConfig } from "dotssm";

const namespace = "/mydomain/myapp";
const config = await getConfig(namespace);
setAppName(config["/name"]);
```

Need to customise the AWS client?

```js
import { withAWSClient } from "dotssm";
import AWS from "aws-sdk";

const namespace = "/mydomain/myapp";
const client = AWS.SSM({ apiVersion: "2014-11-06" });
const getConfig = withAWSClient(client);
const config = await getConfig(namespace);
```

The client making the above request requires the following IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:ssm:GetParametersByPath"],
      "Resource": "arn:aws:ssm:region:account-id:parameter/mydomain/myapp/*"
    }
  ]
}
```

## Motivation (Notes)

TODO: Tidy this up

### 1. SSM is a good place to put application config

You want all your config in one place.
Environment variables? 12 factor app.
Secrets can't go in environment variables in Lambda.
Why not secrets manager? - Too complicated!
SSM is the right balance of flexibility to simplicity.

### 2. You want a single config interface

When writing application code, it really sucks to have
to read from multiple config sources.
If you are reading _either_ from an env var (when running locally)
or SSM (when running in an AWS environment) you have sync code
in one instance and async in another. It's all a bit of a mess.

### 3. You want to run offline

When developing locally, it's a pain to be logged in to an environment.
You should be able to develop your applications entirely offline.
A local config file allows you to do this.

## Contributing

Please read the [contribution guidelines](CONTRIBUTING.md).
