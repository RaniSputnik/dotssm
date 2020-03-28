# Contributing

Getting set up:

```sh
npm i     # Install dependencies
npm test  # Run unit tests
```

Running the acceptance tests (requires [Pulumi](https://www.pulumi.com/)).

```
pulumi up -C acceptance/infra
npm run test:acceptance
```
