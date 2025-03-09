export function extractPrice(priceText: string): number {
  const priceMatch = priceText.match(/\d+/);
  if (priceMatch) {
    return parseInt(priceMatch[0], 10);
  }
  return 0;
}

export function isElementVisible(selector: string): Cypress.Chainable<boolean> {
  return cy.document().then((doc) => {
    const element = doc.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    return false;
  });
}

export function waitForHomepageToLoad(): void {
  cy.url().should('match', /demoblaze\.com\/?(?:index\.html)?$/);
  cy.get('.card').should('be.visible');
  cy.get('.card').should('have.length.at.least', 1);
  cy.wait(2000);
}

export function waitForCartToLoad(): void {
  cy.url().should('include', 'cart.html');
  cy.contains('Products').should('be.visible');
  cy.wait(2000);
}

export function navigateToCart(): void {
  cy.get('#cartur').click();
  cy.url().should('include', 'cart.html');
  waitForCartToLoad();
}

export function navigateToHomepage(): void {
  cy.get('a.nav-link').contains('Home').click();
  waitForHomepageToLoad();
}

export function findProductRowsInCart(productName: string): Cypress.Chainable<any> {
  return cy.get('body').then($body => {
    const visibleRows = $body.find('#tbodyid tr:visible');
    return visibleRows.filter((i, row) => Cypress.$(row).text().includes(productName));
  });
}

export function setupApiInterceptors(): void {
  cy.intercept({
    method: 'GET',
    url: '**/entries'
  }).as('getProducts');
  
  cy.intercept({
    method: 'POST',
    url: '**/addtocart*'
  }).as('addToCart');
  
  cy.intercept({
    method: 'POST',
    url: '**/viewcart*'
  }).as('getCart');
  
  cy.intercept({
    method: 'POST',
    url: '**/deleteitem*'
  }).as('deleteFromCart');

  cy.intercept({
    method: 'POST',
    url: '**/purchaseorder*'
  }).as('purchaseOrder');
}

export function selectProduct(index: number = 0): Cypress.Chainable<{name: string, price: number}> {
  cy.get('.card-title a').should('be.visible');
  cy.get('.card-title a').eq(index).click({ force: true });
  cy.get('.name').should('be.visible');
  cy.get('.price-container').should('be.visible');
  return cy.get('.name').then($name => {
    const name = $name.text().trim();
    return cy.get('.price-container').then($price => {
      const priceText = $price.text().trim();
      const price = extractPrice(priceText);
      return { name, price };
    });
  });
}

export function addCurrentProductToCart(times: number = 1): void {
  cy.get('.btn-success').contains('Add to cart').should('be.visible');
  for (let i = 0; i < times; i++) {
    cy.get('.btn-success').contains('Add to cart').click({ force: true });
    cy.wait(1000);
  }
}

export function removeProductFromCart(productName: string): void {
  waitForCartToLoad();  
  findProductRowsInCart(productName).then(productRows => {
    if (productRows.length === 0) {
      throw new Error(`No se encontró el producto ${productName} en el carrito para eliminarlo`);
    }
    const firstProductRow = productRows[0];
    const deleteButton = Cypress.$(firstProductRow).find('a:contains("Delete")');
    if (deleteButton.length === 0) {
      throw new Error(`No se encontró el botón de eliminar para el producto ${productName}`);
    }
    cy.wrap(deleteButton).click({ force: true });
    cy.wait(2000);
  });
}

export function fillForm(formData: Record<string, string>, fieldMapping: Record<string, string>): void {
  Object.entries(formData).forEach(([field, value]) => {
    if (fieldMapping[field]) {
      cy.get(fieldMapping[field]).type(value);
    }
  });
}

export function clearCart(): void {
  navigateToCart();  
  cy.get('body').then($body => {
    const visibleRows = $body.find('#tbodyid tr:visible');    
    if (visibleRows.length > 0) {      
      cy.get('a').contains('Delete').each(($btn) => {
        cy.wrap($btn).click({ force: true });
        cy.wait(1000);
      });
      cy.reload();
      cy.wait(2000);
    }
  });
} 