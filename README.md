# MedX Protocol Smart Contracts & OpenCare Dev Blockchain Server

[![Logo](assets/medcredwhitecropped.png)](https://medcredits.io/)

Smart contracts used by MedX Protocol.

OpenCare dApp readme is location [here](dapp/README.md)

### Setup

`$ npm install`

### Running

#### Environment Variables

Prior to running the ganache-cli server, you will need to set up your environment variables:

1. `cp .envrc.example .envrc`

2. Enter your own twelve random words in the .envrc. <strong>Do not use the words in the example file</strong>, if you do that there will be collisions with encryption data.

3. Also, we'll leverage Infura's Ethereum Ropsten testnet node, so make sure to set up an account and paste your private key in your .envrc.

4. Use `direnv allow` to export the env vars into your current terminal shell.

### Testing Contracts

To run the truffle tests:

`$ npm run test`

### To run the Ganache server:

`$ npm run ganache`

### To run the beta faucet lambda endpoint:

Install the npm packages in the `lambda` dir:

```sh
$ cd lambda
$ npm i
$ cd ..
```

Then compile the functions and run the server with:

`$ npm run lambda` (boots up lambda compute endpoints)

### Running the dApp (Webpack Dev server)

Install the npm packages in the `dapp` dir:

```sh
$ cd dapp
$ npm i
$ cd ..
```

`$ npm run dapp`

### Compilation

Addresses for mainnet and test nets are stored in networks/ and merged using the `truffle-deploy-registry` command `apply-registry build/contracts`.  There is an npm script for compilation you can run that combines `truffle compile` with the merge command:

`$ npm run compile`

### Migration

To deploy/migrate the contracts:

`$ truffle migrate`
