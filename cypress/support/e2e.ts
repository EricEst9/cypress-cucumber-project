import './commands'

let consoleSpies: {
  errorSpy: Cypress.Agent<sinon.SinonSpy>;
  warnSpy: Cypress.Agent<sinon.SinonSpy>;
  infoSpy: Cypress.Agent<sinon.SinonSpy>;
  logSpy: Cypress.Agent<sinon.SinonSpy>;
};

Cypress.on('uncaught:exception', (err: Error, runnable: Mocha.Runnable) => {
  return false;
});

beforeEach(() => {
  cy.checkConsoleMessages().then((spies) => {
    consoleSpies = spies;
  });
});

afterEach(() => {
  cy.wrap(consoleSpies.errorSpy).should('not.be.called', 'No debería haber errores en la consola');
});