/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("they click on the {string} link in the header", function(linkText: string) {
  cy.contains('a', linkText).should('be.visible').click();
  cy.wait(500);
});

Then("they should see the contact modal", function() {
  cy.get('#exampleModal').should('be.visible');
  cy.contains('h5', 'New message').should('be.visible');
});

Then("the modal should contain a contact form", function() {
  cy.get('#exampleModal').within(() => {
    cy.get('#recipient-email').should('be.visible');
    cy.get('#recipient-name').should('be.visible');
    cy.get('#message-text').should('be.visible');
    cy.contains('button', 'Send message').should('be.visible');
    cy.contains('button', 'Close').should('be.visible');
  });
});

When("they complete the contact form with valid data", function() {
  cy.get('#exampleModal').within(() => {
    cy.get('#recipient-email').type('test@example.com');
    cy.get('#recipient-name').type('Test User');
    cy.get('#message-text').type('This is a test message from Cypress automated testing.');
  });
});

When("they click on the {string} button", function(buttonText: string) {
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('Thanks for the message!!');
  });
  
  cy.get('#exampleModal').within(() => {
    cy.contains('button', buttonText).click();
  });
  cy.wait(1000);
});

Then("the modal should close when clicking the Close button", function() {
  cy.get('body').then(($body) => {
    if ($body.find('#videoModal.show').length > 0) {
      cy.get('#videoModal > .modal-dialog > .modal-content > .modal-footer > .btn').click();
      cy.get('#videoModal').should('not.be.visible');
    } else if ($body.find('#exampleModal.show').length > 0) {
      cy.get('#exampleModal .modal-footer button.btn-secondary').click();
      cy.get('#exampleModal').should('not.be.visible');
    } else {
    }
  });
});

Then("they should see the About us modal", function() {
  cy.get('#videoModal').should('be.visible');
  cy.contains('h5', 'About us').should('be.visible');
});

Then("the modal should contain a video", function() {
  cy.get('#videoModal').within(() => {
    cy.get('video').should('exist');
  });
});

Then("they should see an error message if the video cannot be loaded", function() {
  cy.get('#videoModal').within(() => {
    cy.contains('The media could not be loaded, either because the server or network failed or because the format is not supported.').should('be.visible');
  });
}); 