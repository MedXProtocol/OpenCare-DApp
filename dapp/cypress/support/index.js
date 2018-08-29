// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')


// import Web3 from "web3"
// import PrivateKeyProvider from "truffle-privatekey-provider"
console.log('etf')
Cypress.on("window:before:load", (win) => {
  console.log('yoooooooooo', win)

  // cy.log(process.env.LAMBDA_CONFIG_PRIVKEY)
  // cy.log('7777776821345768t134i876t234g')
  //
  // const provider = new PrivateKeyProvider(
  //   process.env.LAMBDA_CONFIG_PRIVKEY,
  //   process.env.LAMBDA_CONFIG_PROVIDER_URL
  // )
  // win.web3 = new Web3(provider) // eslint-disable-line no-param-reassign
});
