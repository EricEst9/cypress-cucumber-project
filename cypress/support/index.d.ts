/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(username: string, password: string): Chainable<any>
    verifyLogin(username: string): Chainable<any>
    generateRandomUsername(baseUsername: string): Chainable<string>
    registerNewUser(baseUsername: string, password: string): Chainable<string>
    loginWithNonExistentUser(username: string, password: string): Chainable<any>
    verifyUserNotExistMessage(): Chainable<any>
    verifyResponseStatusCode(alias: string, statusCode: number): Chainable<any>
    logout(): Chainable<any>
    verifyNotAuthenticated(): Chainable<any>
    checkNoConsoleErrors(): Chainable<any>
    checkConsoleMessages(): Chainable<{
      errorSpy: Cypress.Agent<sinon.SinonSpy>;
      warnSpy: Cypress.Agent<sinon.SinonSpy>;
      infoSpy: Cypress.Agent<sinon.SinonSpy>;
      logSpy: Cypress.Agent<sinon.SinonSpy>;
    }>
    visitHomePage(): Chainable<any>
    verifyProductInCategory(productName: string): Chainable<any>
    navigateToCategory(categoryName: string): Chainable<any>
  }
} 