// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


import Web3 from "web3"
import PrivateKeyProvider from "truffle-privatekey-provider"


cy.on("window:before:load", (win) => {
  cy.log(process.env.LAMBDA_CONFIG_PRIVKEY)
  cy.log('7777776821345768t134i876t234g')
  const provider = new PrivateKeyProvider(
    process.env.LAMBDA_CONFIG_PRIVKEY,
    process.env.LAMBDA_CONFIG_PROVIDER_URL
  )
  win.web3 = new Web3(provider) // eslint-disable-line no-param-reassign
});
