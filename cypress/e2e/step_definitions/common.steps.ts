import { Given } from "@badeball/cypress-cucumber-preprocessor";
import { setupApiInterceptors } from "../../support/utils";

Given("the user loads the homepage", function() {
  setupApiInterceptors();
  cy.visitHomePage();
  cy.url().should('include', '/');
  cy.get('nav').should('be.visible');
  cy.contains('a', 'Home').should('be.visible');
}); 