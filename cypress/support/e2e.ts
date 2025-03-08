// ***********************************************************
// This example support/e2e.ts is processed and
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

// Import commands.ts using ES2015 syntax:
import './commands'

// Variables para almacenar los espías de la consola
let consoleSpies: {
  errorSpy: Cypress.Agent<sinon.SinonSpy>;
  warnSpy: Cypress.Agent<sinon.SinonSpy>;
  infoSpy: Cypress.Agent<sinon.SinonSpy>;
  logSpy: Cypress.Agent<sinon.SinonSpy>;
};

// Configuración adicional para Cucumber
Cypress.on('uncaught:exception', (err: Error, runnable: Mocha.Runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Antes de cada prueba, configurar los espías de la consola
beforeEach(() => {
  cy.checkConsoleMessages().then((spies) => {
    consoleSpies = spies;
  });
});

// Después de cada prueba, verificar que no hay errores en la consola
afterEach(() => {
  cy.wrap(consoleSpies.errorSpy).should('not.be.called', 'No debería haber errores en la consola');
});