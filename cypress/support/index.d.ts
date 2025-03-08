/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Comando personalizado para iniciar sesión
     * @example cy.login('username', 'password')
     */
    login(username: string, password: string): Chainable<any>

    /**
     * Comando personalizado para verificar que el usuario ha iniciado sesión
     * @example cy.verifyLogin('username')
     */
    verifyLogin(username: string): Chainable<any>

    /**
     * Comando personalizado para generar un nombre de usuario con un número aleatorio de 5 dígitos
     * @example cy.generateRandomUsername('TestUser')
     */
    generateRandomUsername(baseUsername: string): Chainable<string>

    /**
     * Comando personalizado para registrar un nuevo usuario
     * @example cy.registerNewUser('TestUser', 'password123')
     */
    registerNewUser(baseUsername: string, password: string): Chainable<string>

    /**
     * Comando personalizado para intentar iniciar sesión con usuario inexistente
     * @example cy.loginWithNonExistentUser('wrongUsername', 'wrongPassword')
     */
    loginWithNonExistentUser(username: string, password: string): Chainable<any>

    /**
     * Comando personalizado para verificar mensaje de error de usuario inexistente
     * @example cy.verifyUserNotExistMessage()
     */
    verifyUserNotExistMessage(): Chainable<any>

    /**
     * Comando personalizado para verificar el código de respuesta HTTP
     * @example cy.verifyResponseStatusCode('@loginRequest', 200)
     */
    verifyResponseStatusCode(alias: string, statusCode: number): Chainable<any>

    /**
     * Comando personalizado para cerrar sesión
     * @example cy.logout()
     */
    logout(): Chainable<any>

    /**
     * Comando personalizado para verificar que el usuario no está autenticado
     * @example cy.verifyNotAuthenticated()
     */
    verifyNotAuthenticated(): Chainable<any>

    /**
     * Comando personalizado para verificar que no hay errores de JavaScript en la consola
     * @example cy.checkNoConsoleErrors()
     */
    checkNoConsoleErrors(): Chainable<any>

    /**
     * Comando personalizado para verificar todos los mensajes de la consola
     * @example cy.checkConsoleMessages()
     */
    checkConsoleMessages(): Chainable<{
      errorSpy: Cypress.Agent<sinon.SinonSpy>;
      warnSpy: Cypress.Agent<sinon.SinonSpy>;
      infoSpy: Cypress.Agent<sinon.SinonSpy>;
      logSpy: Cypress.Agent<sinon.SinonSpy>;
    }>

    /**
     * Comando personalizado para visitar la página principal
     * @example cy.visitHomePage()
     */
    visitHomePage(): Chainable<any>

    /**
     * Comando personalizado para verificar un producto en una categoría
     * @example cy.verifyProductInCategory('Samsung galaxy s6')
     */
    verifyProductInCategory(productName: string): Chainable<any>

    /**
     * Comando personalizado para navegar a una categoría
     * @example cy.navigateToCategory('Phones')
     */
    navigateToCategory(categoryName: string): Chainable<any>
  }
} 