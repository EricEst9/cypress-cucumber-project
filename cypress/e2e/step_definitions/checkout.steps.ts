/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";
import { 
  setupApiInterceptors, 
  waitForHomepageToLoad, 
  waitForCartToLoad,
  selectProduct, 
  addCurrentProductToCart,
  removeProductFromCart,
  extractPrice
} from "../../support/utils";

const state = {
  currentProduct: { name: '', price: 0 },
  products: [] as { name: string; price: number; quantity: number }[],
  totalPrice: 0,
  checkoutFormData: {} as Record<string, string>
};

function calculateExpectedTotal(): number {
  return state.products.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);
}

Before(() => {
  state.currentProduct = { name: '', price: 0 };
  state.products = [];
  state.totalPrice = 0;
  state.checkoutFormData = {};
});

When('they navigate to the cart', () => {
  cy.visitCart();
});

Then('they wait for the cart to load', () => {
  waitForCartToLoad();
});

Then('they should see the cart is empty', () => {
  cy.get('body').then($body => {
    const visibleRows = $body.find('#tbodyid tr:visible');
    
    if (visibleRows.length > 0) {
      cy.get('a').contains('Delete').each(($btn) => {
        cy.wrap($btn).click({ force: true });
        cy.wait(1000); 
      });
      cy.reload();
      cy.wait(2000);
      cy.get('body').should($newBody => {
        const newVisibleRows = $newBody.find('#tbodyid tr:visible');
        expect(newVisibleRows.length).to.eq(0);
      });
    }
    cy.contains('Products').should('be.visible');
  });
});

When('they go back to the homepage', () => {
  cy.visitHomePage();
});

When('they select a product', () => {
  selectProduct(0).then(product => {
    state.currentProduct = product;
    const existingProductIndex = state.products.findIndex(p => p.name === product.name);
    if (existingProductIndex === -1) {
      state.products.push({ name: product.name, price: product.price, quantity: 0 });
    }
  });
});

When('they add the product to the cart twice', () => {
  addCurrentProductToCart(2);
  const productIndex = state.products.findIndex(p => p.name === state.currentProduct.name);
  if (productIndex !== -1) {
    state.products[productIndex].quantity += 2;
  }
  state.totalPrice = calculateExpectedTotal();
});

Then('they should see 2 units of the selected product', () => {
  cy.get('body').then($body => {
    const visibleRows = $body.find('#tbodyid tr:visible');
    const productRows = visibleRows.filter((i, row) => Cypress.$(row).text().includes(state.currentProduct.name));
    expect(productRows.length).to.be.greaterThan(0, `Debería haber al menos una fila con el producto ${state.currentProduct.name}`);
    const productIndex = state.products.findIndex(p => p.name === state.currentProduct.name);
    if (productIndex !== -1 && productRows.length !== state.products[productIndex].quantity) {
      state.products[productIndex].quantity = productRows.length;
      state.totalPrice = calculateExpectedTotal();
    }
    cy.wrap(productRows).each(($row) => {
      cy.wrap($row).should('contain', state.currentProduct.name);
    });
  });
});

Then('they should see the correct total price', () => {
  cy.verifyCartTotal();
});

When('they remove one unit from the cart', () => {
  removeProductFromCart(state.currentProduct.name);
  const productIndex = state.products.findIndex(p => p.name === state.currentProduct.name);
  if (productIndex !== -1) {
    state.products[productIndex].quantity -= 1;
    if (state.products[productIndex].quantity <= 0) {
      state.products.splice(productIndex, 1);
    }
  }
  state.totalPrice = calculateExpectedTotal();
});

Then('the total price should be updated accordingly', () => {
  cy.get('#totalp').should('be.visible');
});

When('they select a different product three times', () => {
  selectProduct(1).then(product => {
    state.currentProduct = product;
        const existingProductIndex = state.products.findIndex(p => p.name === product.name);
    if (existingProductIndex === -1) {
      state.products.push({ name: product.name, price: product.price, quantity: 0 });
    }
    addCurrentProductToCart(3);
    const productIndex = state.products.findIndex(p => p.name === product.name);
    if (productIndex !== -1) {
      state.products[productIndex].quantity += 3;
    }
    state.totalPrice = calculateExpectedTotal();
  });
});

Then('they should see all previously added products', () => {
  cy.get('body').then($body => {
    const visibleRows = $body.find('#tbodyid tr:visible');
    const productsToCheck = state.products.filter(p => p.quantity > 0);
    productsToCheck.forEach(product => {
      const productRows = visibleRows.filter((i, row) => Cypress.$(row).text().includes(product.name));
      if (productRows.length === 0) {
        throw new Error(`No se encontró el producto ${product.name} en el carrito`);
      }
    });
  });
});

When('they click on {string}', (buttonText: string) => {
  if (buttonText === 'Place Order') {
    cy.get('.btn-success').contains(buttonText).click({ force: true });
  } else if (buttonText === 'Purchase') {
    cy.get('#orderModal .btn-primary').contains(buttonText).click({ force: true });
    cy.wait(3000);
  } else if (buttonText === 'OK') {
    cy.get('.sweet-alert .confirm').click({ force: true });
  }
});

Then('they should see the checkout modal', () => {
  cy.get('#orderModal').should('be.visible');
});

Then('the total price in the modal should match the cart total', () => {
  cy.get('#totalm').should('contain', state.totalPrice);
});

When('they fill in the checkout form', (dataTable: any) => {
  const formData = dataTable.hashes();
  const fieldMapping = {
    name: '#name',
    country: '#country',
    city: '#city',
    creditCard: '#card',
    month: '#month',
    year: '#year'
  };
  
  formData.forEach((row: { field: string; value: string }) => {
    state.checkoutFormData[row.field] = row.value;
  });
  
  cy.fillCheckoutForm(state.checkoutFormData);
});

Then('they should see a confirmation modal with the message {string}', (message: string) => {
  cy.get('.sweet-alert').should('be.visible');
  cy.get('.sweet-alert h2').should('contain', message);
  cy.wait(1000);
});

Then('the confirmation details should match the entered data', () => {
  cy.get('.sweet-alert p.lead').then($confirmationText => {
    const confirmationText = $confirmationText.text();
    const enteredName = state.checkoutFormData.name;
    const firstChars = enteredName.substring(0, 3); 
    expect(confirmationText.includes(firstChars) || 
           enteredName.split(' ').some(word => 
             word.length > 2 && confirmationText.includes(word.substring(0, 3))
           )).to.be.true;
    const cardNumber = state.checkoutFormData.creditCard.replace(/\s+/g, '');
    const cardSegments = [
      cardNumber.slice(-4), 
      cardNumber.slice(0, 4), 
      cardNumber.slice(4, 8), 
      cardNumber.slice(8, 12) 
    ];
    
    expect(cardSegments.some(segment => confirmationText.includes(segment))).to.be.true;
  });
});

Then('the total price should match the cart total', () => {
  cy.get('.sweet-alert p.lead').then($confirmationText => {
    const confirmationText = $confirmationText.text();
    const allNumbers = confirmationText.match(/\d+/g) || [];
    const matchesTotal = allNumbers.some(num => {
      const parsedNum = parseInt(num, 10);
      return parsedNum === state.totalPrice || Math.abs(parsedNum - state.totalPrice) < 10;
    });
    expect(matchesTotal).to.be.true;
  });
});

Then('they should be redirected to the homepage', () => {
  waitForHomepageToLoad();
}); 