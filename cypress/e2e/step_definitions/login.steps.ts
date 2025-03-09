/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let userData: { username: string; password: string };
let invalidUserData: { username: string; password: string };

before(() => {
  cy.fixture('users.json').then((users: any) => {
    userData = users.validUser;
    invalidUserData = users.invalidUser;
  });
});

When("they enter valid credentials", function() {
  cy.login(userData.username, userData.password);
});

Then("they should access the main screen", function() {
  cy.verifyLogin(userData.username);
});

Then("they should see their username in the navigation bar", function() {
  cy.get("#nameofuser").should("be.visible").and("contain", `Welcome ${userData.username}`);
});

When("they enter a username that does not exist", function() {
  cy.intercept('POST', '**/login').as('loginRequest');
  cy.loginWithNonExistentUser(invalidUserData.username, invalidUserData.password);
});

Then("they should see a message indicating the user does not exist", function() {
  cy.verifyUserNotExistMessage();
});

Then("the HTTP response should have a {int} status code", function(statusCode: number) {
  cy.verifyResponseStatusCode('@loginRequest', statusCode);
});

When("they log out", function() {
  cy.get("#nameofuser").should("be.visible");
  cy.get("#logout2").should("be.visible");
  cy.logout();
});

Then("they should return to the homepage without being authenticated", function() {
  cy.verifyNotAuthenticated();
}); 