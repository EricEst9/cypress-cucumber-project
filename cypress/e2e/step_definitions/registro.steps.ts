/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Variables para almacenar los datos del nuevo usuario
let newUserData: { baseUsername: string; password: string };
let generatedUsername: string;
let existingUserData: { username: string; password: string };

beforeEach(() => {
  // Cargar los datos de prueba antes de cada escenario
  cy.fixture('users.json').then((users: any) => {
    newUserData = users.newUser;
    existingUserData = users.validUser; // Usuario existente del test de login
  });
  
  // Configurar Cypress para manejar automáticamente las alertas
  cy.on('window:alert', (text: string) => {
    // Solo retornar true para cerrar la alerta automáticamente
    return true;
  });
});

// Comentamos este paso para evitar conflictos con la definición en navigation.steps.ts
// Given("el usuario está en la página principal", function() {
//   // Utilizar el comando personalizado para visitar la página principal
//   cy.visitHomePage();
// });

When("registra un nuevo usuario", function() {
  // Registrar un nuevo usuario y almacenar el nombre de usuario generado
  cy.registerNewUser(newUserData.baseUsername, newUserData.password).then((username: string) => {
    generatedUsername = username;
  });
});

When("cierra la alerta de registro exitoso", function() {
  // La alerta ya se maneja automáticamente en el beforeEach
  // Esperar un tiempo suficiente para que la alerta se cierre completamente
  cy.wait(2000);
  
  // Verificar que el modal de registro ya no esté visible
  cy.get('#signInModal').should('not.be.visible');
});

When("inicia sesión con las credenciales del nuevo usuario", function() {
  // Esperar un momento antes de intentar iniciar sesión
  cy.wait(1000);
  
  // Iniciar sesión con el nuevo usuario
  cy.login(generatedUsername, newUserData.password);
});

Then("debe acceder a la pantalla principal con el nuevo usuario", function() {
  // Verificar que el usuario ha iniciado sesión correctamente
  cy.verifyLogin(generatedUsername);
});

When("intenta registrar un usuario ya existente", function() {
  // Configurar el listener para la alerta antes de hacer clic en el botón
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('This user already exist');
  });
  
  // Hacer clic en el enlace de registro y esperar a que el modal esté visible
  cy.get('#signin2').click();
  cy.get('#signInModal').should('be.visible');
  
  // Esperar a que los campos del formulario estén visibles
  cy.get('#sign-username').should('be.visible').clear().type(existingUserData.username, { force: true });
  cy.get('#sign-password').should('be.visible').clear().type(existingUserData.password, { force: true });
  
  // Esperar un momento para asegurar que los campos se hayan completado
  cy.wait(500);
  
  // Enviar el formulario
  cy.get('button[onclick="register()"]').should('be.visible').click();
  
  // Esperar un momento para que aparezca la alerta
  cy.wait(1000);
});

Then("debe ver un mensaje indicando que el usuario ya existe", function() {
  // Este paso ya se ha verificado en el paso anterior mediante el listener de alerta
  // No es necesario hacer nada más aquí
  cy.log('Se ha verificado el mensaje de usuario ya existente');
}); 