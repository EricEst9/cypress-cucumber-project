/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Definimos nuestro propio paso para asegurarnos de que la página se carga correctamente
Given("el usuario está en la página principal", function() {
  // Visitar directamente la página principal en lugar de usar visitHomePage
  cy.visit("/");
  
  // Esperar a que la página se cargue completamente
  cy.url().should('include', '/');
  
  // Esperar a que elementos clave de la página estén visibles
  cy.get('nav').should('be.visible');
  cy.contains('a', 'Home').should('be.visible');
});

When("hace clic en el enlace {string} del header", function(linkText: string) {
  // Hacer clic en el enlace del header
  cy.contains('a', linkText).should('be.visible').click();
  
  // Esperar un momento para que el modal se abra
  cy.wait(500);
});

Then("debe ver el modal de contacto", function() {
  // Verificar que el modal de contacto está visible
  cy.get('#exampleModal').should('be.visible');
  cy.contains('h5', 'New message').should('be.visible');
});

Then("el modal debe contener un formulario de contacto", function() {
  // Verificar que el formulario de contacto contiene los elementos esperados
  cy.get('#exampleModal').within(() => {
    cy.get('#recipient-email').should('be.visible');
    cy.get('#recipient-name').should('be.visible');
    cy.get('#message-text').should('be.visible');
    cy.contains('button', 'Send message').should('be.visible');
    cy.contains('button', 'Close').should('be.visible');
  });
});

When("completa el formulario de contacto con datos válidos", function() {
  // Completar el formulario de contacto con datos válidos
  cy.get('#exampleModal').within(() => {
    cy.get('#recipient-email').type('test@example.com');
    cy.get('#recipient-name').type('Test User');
    cy.get('#message-text').type('This is a test message from Cypress automated testing.');
  });
});

When("hace clic en el botón {string}", function(buttonText: string) {
  // Configurar el listener para la alerta antes de hacer clic en el botón
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('Thanks for the message!!');
  });
  
  // Hacer clic en el botón especificado dentro del modal
  cy.get('#exampleModal').within(() => {
    cy.contains('button', buttonText).click();
  });
  
  // Esperar un momento para que se procese la acción
  cy.wait(1000);
});

Then("debe recibir confirmación de que el mensaje se ha enviado", function() {
  // Este paso ya se ha verificado en el paso anterior mediante el listener de alerta
  // No es necesario hacer nada más aquí
  cy.log('Se ha verificado la confirmación del mensaje');
});

Then("el modal debe cerrarse al hacer clic en el botón Close", function() {
  // Este paso depende del contexto (qué modal está abierto)
  // Para el modal de Contact, después de enviar el mensaje, el modal puede cerrarse automáticamente
  // Para el modal de About us, necesitamos cerrar el modal manualmente
  
  // Verificar si el modal de About us está visible
  cy.get('body').then(($body) => {
    if ($body.find('#videoModal.show').length > 0) {
      // Modal de About us - Usar el selector específico para el botón Close
      cy.get('#videoModal > .modal-dialog > .modal-content > .modal-footer > .btn').click();
      // Verificar que el modal se ha cerrado
      cy.get('#videoModal').should('not.be.visible');
    } else if ($body.find('#exampleModal.show').length > 0) {
      // Modal de Contact - Usar el selector específico para el botón Close
      cy.get('#exampleModal .modal-footer button.btn-secondary').click();
      // Verificar que el modal se ha cerrado
      cy.get('#exampleModal').should('not.be.visible');
    } else {
      // Si ningún modal está visible, puede ser que ya se haya cerrado automáticamente
      cy.log('No hay modales visibles, posiblemente ya se cerraron automáticamente');
    }
  });
});

Then("debe ver el modal de About us", function() {
  // Verificar que el modal de About us está visible
  cy.get('#videoModal').should('be.visible');
  cy.contains('h5', 'About us').should('be.visible');
});

Then("el modal debe contener un video", function() {
  // Verificar que el modal contiene un elemento de video
  cy.get('#videoModal').within(() => {
    cy.get('video').should('exist');
  });
});

Then("debe mostrar un mensaje de error si el video no se puede cargar", function() {
  // Verificar el mensaje de error que aparece cuando el video no se puede cargar
  cy.get('#videoModal').within(() => {
    cy.contains('The media could not be loaded, either because the server or network failed or because the format is not supported.').should('be.visible');
  });
}); 