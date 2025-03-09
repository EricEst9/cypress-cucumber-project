/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let newUserData: { baseUsername: string; password: string };
let generatedUsername: string;
let existingUserData: { username: string; password: string };

beforeEach(() => {
  cy.fixture('users.json').then((users: any) => {
    newUserData = users.newUser;
    existingUserData = users.validUser;
  });
  
  cy.on('window:alert', (text: string) => {
    return true;
  });
});

When("they register a new user", function() {
  cy.registerNewUser(newUserData.baseUsername, newUserData.password).then((username: string) => {
    generatedUsername = username;
  });
});

When("they close the successful registration alert", function() {
  cy.wait(2000);
  cy.get('#signInModal').should('not.be.visible');
});

When("they log in with the new user credentials", function() {
  cy.wait(1000);
  cy.login(generatedUsername, newUserData.password);
});

Then("they should access the main screen with the new user", function() {
  cy.verifyLogin(generatedUsername);
});

When("they attempt to register an existing user", function() {
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('This user already exist');
  });
  cy.get('#signin2').click();
  cy.get('#signInModal').should('be.visible');
  cy.get('#sign-username').should('be.visible').clear().type(existingUserData.username, { force: true });
  cy.get('#sign-password').should('be.visible').clear().type(existingUserData.password, { force: true });
  cy.wait(500);
  cy.get('button[onclick="register()"]').should('be.visible').click();
  cy.wait(1000);
});