/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      visitHomePage(): Chainable<void>;
      visitCart(): Chainable<void>;
      addProductToCart(index: number, quantity: number): Chainable<void>;
      removeProductFromCart(productName: string): Chainable<void>;      
      verifyProductInCart(productName: string): Chainable<boolean>;
      fillCheckoutForm(userData: Record<string, string>): Chainable<void>;
      clearCart(): Chainable<void>;
      verifyCartTotal(expectedTotal?: number): Chainable<number>;
    }
  }
}

import { 
  waitForHomepageToLoad, 
  waitForCartToLoad,
  selectProduct, 
  addCurrentProductToCart,
  removeProductFromCart as removeProduct,
  findProductRowsInCart,
  clearCart as clearCartUtil
} from './utils';

let hasVisitedHomePage = false;

Cypress.Commands.add('visitHomePage', () => {
  cy.visit('/');
  waitForHomepageToLoad();
});

before(() => {
  hasVisitedHomePage = false;
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.get("#login2").click();
  cy.get("#logInModal").should('be.visible');
  cy.get("#loginusername").should('be.visible').clear().type(username, { force: true });
  cy.get("#loginpassword").should('be.visible').clear().type(password, { force: true });
  cy.wait(500);
  cy.get("button[onclick='logIn()']").should('be.visible').click();
  cy.wait(1000);
});

Cypress.Commands.add('verifyLogin', (username: string) => {
  cy.get("#nameofuser").should("contain", `Welcome ${username}`);
});

Cypress.Commands.add('loginWithNonExistentUser', (username: string, password: string) => {
  cy.intercept('POST', '**/login').as('loginRequest');
  cy.get("#login2").click();
  cy.get("#logInModal").should('be.visible');
  cy.get("#loginusername").should('be.visible').clear().type(username, { force: true });
  cy.get("#loginpassword").should('be.visible').clear().type(password, { force: true });
  cy.wait(500);
  cy.get("button[onclick='logIn()']").should('be.visible').click();
  cy.wait('@loginRequest');
});

Cypress.Commands.add('verifyUserNotExistMessage', () => {
  cy.on('window:alert', (text: string) => {
    expect(text).to.include('User does not exist');
  });
});

Cypress.Commands.add('verifyResponseStatusCode', (alias: string, statusCode: number) => {
  cy.wait(alias).its('response.statusCode').should('eq', statusCode);
});

Cypress.Commands.add('logout', () => {
  cy.get("#logout2").should('be.visible');
  cy.get("#logout2").click();
  cy.wait(1000);
  cy.wait(1000);
  cy.url().should('include', '/');
});

Cypress.Commands.add('verifyNotAuthenticated', () => {
  cy.get("#login2").should('be.visible');
  cy.get('body').then(($body) => {
    if ($body.find('#logout2').length > 0) {
      cy.get("#logout2").should('not.be.visible');
    }
    });
  cy.get('body').then(($body) => {
    if ($body.find('#nameofuser').length > 0) {
      cy.get("#nameofuser").should('not.be.visible');
    }
  });
  cy.url().should('include', '/');
});

Cypress.Commands.add('generateRandomUsername', (baseUsername: string) => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  const username = `${baseUsername}${randomNum}`;
  return cy.wrap(username);
});

Cypress.Commands.add('registerNewUser', (baseUsername: string, password: string) => {
  return cy.generateRandomUsername(baseUsername).then((username: string) => {
    cy.on('window:alert', (text: string) => {
      expect(text).to.include('Sign up successful');
    });    
    cy.get('#signin2').click();
    cy.get('#signInModal').should('be.visible');    
    cy.get('#sign-username').should('be.visible').clear().type(username, { force: true });
    cy.get('#sign-password').should('be.visible').clear().type(password, { force: true });    
    cy.wait(500);    
    cy.get('button[onclick="register()"]').should('be.visible').click();    
    cy.wait(1000);
    return cy.wrap(username);
  });
});

Cypress.Commands.add('checkNoConsoleErrors', () => {
  cy.window().then((win) => {
    const errorSpy = cy.spy(win.console, 'error');
    cy.wrap(errorSpy).should('not.be.called');
  });
});

Cypress.Commands.add('checkConsoleMessages', () => {
  cy.window().then((win) => {
    const errorSpy = cy.spy(win.console, 'error');
    const warnSpy = cy.spy(win.console, 'warn');
    const infoSpy = cy.spy(win.console, 'info');
    const logSpy = cy.spy(win.console, 'log');
    return {
      errorSpy,
      warnSpy,
      infoSpy,
      logSpy
    };
  });
});

Cypress.Commands.add('verifyProductInCategory', (productName: string) => {
  cy.contains('.card-title', productName).should('be.visible');
  cy.contains('.card-title', productName)
    .parents('.card')
    .find('.card-block')
    .find('h5')
    .should('contain', '$');
  cy.contains('.card-title', productName)
    .parents('.card')
    .find('.card-block')
    .find('a')
    .should('have.length.at.least', 1);
});

Cypress.Commands.add('navigateToCategory', (categoryName: string) => {
  cy.contains('.list-group-item', categoryName).click();
  cy.wait(1000);
  cy.contains('.list-group-item', categoryName).should('be.visible');
});

Cypress.Commands.add('visitCart', () => {
  cy.get('#cartur').click();
  waitForCartToLoad();
});

Cypress.Commands.add('addProductToCart', (index: number, quantity: number) => {
  cy.visitHomePage();
  selectProduct(index).then(() => {
    addCurrentProductToCart(quantity);
  });
});

Cypress.Commands.add('removeProductFromCart', (productName: string) => {
  cy.visitCart();
  removeProduct(productName);
});

Cypress.Commands.add('verifyProductInCart', (productName: string) => {
  return findProductRowsInCart(productName).then(rows => {
    return rows.length > 0;
  });
});

Cypress.Commands.add('fillCheckoutForm', (userData: Record<string, string>) => {
  const fieldMapping = {
    name: '#name',
    country: '#country',
    city: '#city',
    creditCard: '#card',
    month: '#month',
    year: '#year'
  };  
  Object.entries(userData).forEach(([field, value]) => {
    const selector = fieldMapping[field as keyof typeof fieldMapping];
    if (selector) {
      cy.get(selector).type(value);
    }
  });
});

Cypress.Commands.add('clearCart', () => {
  clearCartUtil();
});

Cypress.Commands.add('verifyCartTotal', (expectedTotal?: number) => {
  return cy.get('#totalp').then($total => {
    if ($total.length > 0) {
      const totalText = $total.text().trim();
      const totalValue = parseInt(totalText.match(/\d+/)?.[0] || '0', 10);      
      if (expectedTotal !== undefined) {
        expect(totalValue).to.equal(expectedTotal);
      }      
      return totalValue;
    }
    return 0;
  });
});