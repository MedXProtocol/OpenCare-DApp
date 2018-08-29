/// <reference types="Cypress" />

context('Sign Up', () => {

  beforeEach(() => {
    //
    // cy.on("window:before:load", (win) => {
    //   cy.log(process.env.LAMBDA_CONFIG_PRIVKEY)
    //   cy.log('7777776821345768t134i876t234g')
    //   const provider = new PrivateKeyProvider(
    //     process.env.LAMBDA_CONFIG_PRIVKEY,
    //     process.env.LAMBDA_CONFIG_PROVIDER_URL
    //   )
    //   win.web3 = new Web3(provider) // eslint-disable-line no-param-reassign
    // })

    cy.visit('http://localhost:3000')

    // cy.window().then((win) => {
    //   // win is the remote window
    //   // of the page at: http://localhost:8080/app
    //   cy.log(win)
    //   cy.log(win.web3)
    // })
  })

  it('shows welcome page and allows sign up flow', () => {
    // cy.log('7777776821345768t134i876t234g')
    // cy.log('7777776821345768t134i876t234g')


    // Cypress.on("window:before:load", (win) => {
    //   cy.log('87979697')
    //   cy.log('87979697')
    //   cy.log('87979697')
    // });


    cy.get('.btn--launch').click()

    cy.title().should('include', 'Sign Up')
  })

})
