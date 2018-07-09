# MedCredits Smart Contracts & Dev Blockchain Server

[![Logo](assets/medcredwhitecropped.png)](https://medcredits.io/)

Smart contracts used by MedCredits.

Hippocrates Dapp readme is location [here](dapp/README.md)

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

`$ npm run start`

### To run the beta faucet lambda endpoint:

`$ ./lambda-serve.sh` (lambda compute endpoints)

### Running Webpack Dev server

See README.md in ./dapp directory

### Migration

To deploy/migrate the contracts:

`$ npm run migrate`
