/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Importar datos de prueba desde el archivo de fixtures
let userData: { username: string; password: string };
let invalidUserData: { username: string; password: string };

// Usamos before de Cypress en lugar de beforeEach
before(() => {
  // Cargar los datos de prueba antes de cada escenario
  cy.fixture('users.json').then((users: any) => {
    userData = users.validUser;
    invalidUserData = users.invalidUser;
  });
});

// Comentamos este paso para evitar conflictos con la definición en navigation.steps.ts
// Given("el usuario está en la página de inicio de sesión", function() {
//   // Utilizar el comando personalizado para visitar la página principal
//   cy.visitHomePage();
// });

When("ingresa credenciales válidas", function() {
  cy.login(userData.username, userData.password);
});

Then("debe acceder a la pantalla principal", function() {
  cy.verifyLogin(userData.username);
});

Then("debe ver su nombre de usuario en la barra de navegación", function() {
  // Verificar que el nombre de usuario se muestra en la barra de navegación
  cy.get("#nameofuser").should("be.visible").and("contain", `Welcome ${userData.username}`);
});

// Pasos para escenarios de login con credenciales incorrectas
When("ingresa un nombre de usuario que no existe", function() {
  // Interceptar la solicitud de inicio de sesión para verificar el código de respuesta
  cy.intercept('POST', '**/login').as('loginRequest');
  
  // Intentar iniciar sesión con un usuario que no existe
  cy.loginWithNonExistentUser(invalidUserData.username, invalidUserData.password);
});

Then("debe ver un mensaje indicando que el usuario no existe", function() {
  // Verificar que aparece una alerta con el mensaje de error
  cy.verifyUserNotExistMessage();
});

Then("la respuesta HTTP debe tener código {int}", function(statusCode: number) {
  // Verificar el código de respuesta HTTP
  cy.verifyResponseStatusCode('@loginRequest', statusCode);
});

// Pasos para escenarios de logout
When("cierra la sesión", function() {
  // Verificar que estamos autenticados antes de cerrar sesión
  cy.get("#nameofuser").should("be.visible");
  cy.get("#logout2").should("be.visible");
  
  // Cerrar sesión
  cy.logout();
});

Then("debe volver a la página principal sin estar autenticado", function() {
  // Verificar que el usuario no está autenticado
  cy.verifyNotAuthenticated();
}); 