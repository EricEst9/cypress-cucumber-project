import { Given } from "@badeball/cypress-cucumber-preprocessor";
import { setupApiInterceptors } from "../../support/utils";

// Common step that's used across multiple feature files
Given("the user loads the homepage", function() {
  // Setup API interceptors (from checkout.steps.ts)
  setupApiInterceptors();
  
  // Visit homepage and verify basic elements
  cy.visitHomePage();
  cy.url().should('include', '/');
  cy.get('nav').should('be.visible');
  cy.contains('a', 'Home').should('be.visible');
}); 