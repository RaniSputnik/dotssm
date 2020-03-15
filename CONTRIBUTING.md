# Contributing

Getting set up:

```sh
npm i     # Install dependencies
npm test  # Run unit tests
```

Running the acceptance tests (requires [Terraform](https://www.terraform.io/) installed).

```
terraform init acceptance/infra
terraform apply acceptance/infra
npm run test:acceptance
```
