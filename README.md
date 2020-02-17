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
const namespace = "/mydomain/myapp";
const config = await getConfig(namespace);
setAppName(config.name) // Do whatever you need to do with config.name here
```

TODO: Example of what IAM permissions the function needs in order to run.

Need to customise the AWS client?

```js
import AWS from "aws-sdk";

const namespace = "/mydomain/myapp";
const client = AWS.SSM({ apiVersion: "2014-11-06" });
const getConfig = withAWSClient(client);
const config = await getConfig(namespace);
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

Getting set up:

```sh
npm i     # Install dependencies
npm test  # Run tests
```

Running the acceptance tests (requires [Terraform](https://www.terraform.io/) installed).

```
terraform init acceptance/infra
terraform apply acceptance/infra
npm run test:acceptance
```

## FAQ

### Why do I need to add a leading / trailing slash on my namespace?

TODO: chat about the implications for IAM Permissions
TODO: should we reconsider this? Perhaps you could just supply the namespace as foo.bar or something like that?