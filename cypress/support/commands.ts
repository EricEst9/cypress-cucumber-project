/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Variable para controlar si ya se ha visitado la página principal
let hasVisitedHomePage = false;

// Comando personalizado para visitar la página principal solo si no se ha visitado antes
Cypress.Commands.add('visitHomePage', () => {
  // Siempre visitar la página principal para evitar problemas
  cy.visit('/');
  
  // Esperar a que la página se cargue completamente
  cy.url().should('include', '/');
  
  // Esperar a que elementos clave de la página estén visibles
  cy.get('nav').should('be.visible');
  cy.contains('a', 'Home').should('be.visible');
  
  // Marcar que hemos visitado la página principal
  hasVisitedHomePage = true;
});

// Reiniciar el estado cuando se inicia una nueva suite de pruebas
before(() => {
  hasVisitedHomePage = false;
});

// Comando personalizado para iniciar sesión
Cypress.Commands.add('login', (username: string, password: string) => {
  // Hacer clic en el enlace de inicio de sesión y esperar a que el modal esté visible
  cy.get("#login2").click();
  cy.get("#logInModal").should('be.visible');
  
  // Esperar a que los campos del formulario estén visibles
  cy.get("#loginusername").should('be.visible').clear().type(username, { force: true });
  cy.get("#loginpassword").should('be.visible').clear().type(password, { force: true });
  
  // Esperar un momento para asegurar que los campos se hayan completado
  cy.wait(500);
  
  // Enviar el formulario
  cy.get("button[onclick='logIn()']").should('be.visible').click();
  
  // Esperar a que se complete el inicio de sesión
  cy.wait(1000);
});

// Comando personalizado para verificar que el usuario ha iniciado sesión
Cypress.Commands.add('verifyLogin', (username: string) => {
  cy.get("#nameofuser").should("contain", `Welcome ${username}`);
});

// Comando personalizado para intentar iniciar sesión con usuario inexistente
Cypress.Commands.add('loginWithNonExistentUser', (username: string, password: string) => {
  // Interceptar la solicitud de inicio de sesión para verificar el código de respuesta
  cy.intercept('POST', '**/login').as('loginRequest');
  
  // Hacer clic en el enlace de inicio de sesión y esperar a que el modal esté visible
  cy.get("#login2").click();
  cy.get("#logInModal").should('be.visible');
  
  // Esperar a que los campos del formulario estén visibles
  cy.get("#loginusername").should('be.visible').clear().type(username, { force: true });
  cy.get("#loginpassword").should('be.visible').clear().type(password, { force: true });
  
  // Esperar un momento para asegurar que los campos se hayan completado
  cy.wait(500);
  
  // Enviar el formulario
  cy.get("button[onclick='logIn()']").should('be.visible').click();
  
  // Esperar a que se complete la solicitud de inicio de sesión
  cy.wait('@loginRequest');
});

// Comando personalizado para verificar mensaje de error de usuario inexistente
Cypress.Commands.add('verifyUserNotExistMessage', () => {
  // Verificar que aparece una alerta con el mensaje de error
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('User does not exist');
  });
});

// Comando personalizado para verificar el código de respuesta HTTP
Cypress.Commands.add('verifyResponseStatusCode', (alias: string, statusCode: number) => {
  cy.wait(alias).its('response.statusCode').should('eq', statusCode);
});

// Comando personalizado para cerrar sesión
Cypress.Commands.add('logout', () => {
  // Verificar que el enlace de cierre de sesión está visible
  cy.get("#logout2").should('be.visible');
  
  // Hacer clic en el enlace de cierre de sesión
  cy.get("#logout2").click();
  
  // Esperar un momento para que se actualice la interfaz
  cy.wait(1000);
  
  // Verificar que hemos vuelto a la página principal
  cy.url().should('include', '/');
});

// Comando personalizado para verificar que el usuario no está autenticado
Cypress.Commands.add('verifyNotAuthenticated', () => {
  // Verificar que el enlace de inicio de sesión está visible
  cy.get("#login2").should('be.visible');
  
  // Verificar que el enlace de cierre de sesión no está visible o no existe
  cy.get('body').then(($body) => {
    if ($body.find('#logout2').length > 0) {
      cy.get("#logout2").should('not.be.visible');
    }
  });
  
  // Verificar que el nombre de usuario no está visible o no existe
  cy.get('body').then(($body) => {
    if ($body.find('#nameofuser').length > 0) {
      cy.get("#nameofuser").should('not.be.visible');
    }
  });
  
  // Verificar que estamos en la página principal
  cy.url().should('include', '/');
});

// Comando personalizado para generar un nombre de usuario con un número aleatorio de 5 dígitos
Cypress.Commands.add('generateRandomUsername', (baseUsername: string) => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // Genera un número aleatorio entre 10000 y 99999
  const username = `${baseUsername}${randomNum}`;
  return cy.wrap(username);
});

// Comando personalizado para registrar un nuevo usuario
Cypress.Commands.add('registerNewUser', (baseUsername: string, password: string) => {
  // Generar un nombre de usuario único con un número aleatorio
  return cy.generateRandomUsername(baseUsername).then((username: string) => {
    // Configurar el listener para la alerta antes de hacer clic en el botón
    cy.on('window:alert', (text: string) => {
      expect(text).to.include('Sign up successful');
    });
    
    // Hacer clic en el enlace de registro y esperar a que el modal esté visible
    cy.get('#signin2').click();
    cy.get('#signInModal').should('be.visible');
    
    // Esperar a que los campos del formulario estén visibles
    cy.get('#sign-username').should('be.visible').clear().type(username, { force: true });
    cy.get('#sign-password').should('be.visible').clear().type(password, { force: true });
    
    // Esperar un momento para asegurar que los campos se hayan completado
    cy.wait(500);
    
    // Enviar el formulario
    cy.get('button[onclick="register()"]').should('be.visible').click();
    
    // Esperar un momento para que aparezca la alerta
    cy.wait(1000);
    
    // Devolver el nombre de usuario generado para su uso posterior
    return cy.wrap(username);
  });
});

// Comando personalizado para verificar que no hay errores de JavaScript en la consola
Cypress.Commands.add('checkNoConsoleErrors', () => {
  cy.window().then((win) => {
    // Espiar el método console.error
    const errorSpy = cy.spy(win.console, 'error');
    
    // Verificar que no se haya llamado al método console.error
    cy.wrap(errorSpy).should('not.be.called');
  });
});

// Comando personalizado para verificar todos los mensajes de la consola (error, warn, info, log)
Cypress.Commands.add('checkConsoleMessages', () => {
  cy.window().then((win) => {
    // Espiar los métodos de la consola
    const errorSpy = cy.spy(win.console, 'error');
    const warnSpy = cy.spy(win.console, 'warn');
    const infoSpy = cy.spy(win.console, 'info');
    const logSpy = cy.spy(win.console, 'log');
    
    // Devolver un objeto con los espías para que puedan ser verificados en los pasos de prueba
    return {
      errorSpy,
      warnSpy,
      infoSpy,
      logSpy
    };
  });
});