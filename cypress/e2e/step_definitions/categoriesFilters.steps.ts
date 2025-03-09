/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

const phoneProducts = ["Samsung galaxy s6", "Nokia lumia 1520", "Nexus 6", "Samsung galaxy s7", "Iphone 6 32gb", "Sony xperia z5", "HTC One M9"];
const laptopProducts = ["Sony vaio i5", "Sony vaio i7", "MacBook air", "Dell i7 8gb", "2017 Dell 15.6 Inch", "MacBook Pro"];
const monitorProducts = ["Apple monitor 24", "ASUS Full HD"];

function productBelongsToCategory(productName: string, categoryProducts: string[]): boolean {
  return categoryProducts.some(categoryProduct => 
    productName.toLowerCase().includes(categoryProduct.toLowerCase())
  );
}

let currentCategory = "";
let currentCarouselImage = '';

When("they click on the {string} category", function(categoryName: string) {
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  let categoryValue = '';
  if (categoryName === "Phones") {
    categoryValue = 'phone';
  } else if (categoryName === "Laptops") {
    categoryValue = 'notebook';
  } else if (categoryName === "Monitors") {
    categoryValue = 'monitor';
  }
  currentCategory = categoryName;
  cy.get(`[onclick="byCat('${categoryValue}')"]`).should('be.visible').click();
  cy.wait(1000);
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
});

Then("they should see only products from the {string} category", function(categoryName: string) {
  cy.url().should('include', '/');
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  cy.get('.card-title').then($products => {
    const productNames: string[] = [];
    
    $products.each((index, element) => {
      productNames.push(Cypress.$(element).text().trim());
    });
    let expectedProducts: string[] = [];
    if (categoryName === "Phones") {
      expectedProducts = phoneProducts;
    } else if (categoryName === "Laptops") {
      expectedProducts = laptopProducts;
    } else if (categoryName === "Monitors") {
      expectedProducts = monitorProducts;
    }
    productNames.forEach(product => {
      const belongsToCategory = productBelongsToCategory(product, expectedProducts);
      expect(belongsToCategory, `Product "${product}" should belong to the ${categoryName} category`).to.be.true;
    });
  });
});

Then("they should not see products from other categories", function() {
  const activeCategory = currentCategory;
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  cy.get('.card-title').then($currentProducts => {
    const currentProductNames: string[] = [];
    $currentProducts.each((index, element) => {
      currentProductNames.push(Cypress.$(element).text().trim());
    });
    if (activeCategory === "Phones") {
      currentProductNames.forEach(product => {
        const isLaptop = productBelongsToCategory(product, laptopProducts);
        const isMonitor = productBelongsToCategory(product, monitorProducts);
        expect(isLaptop || isMonitor, `Product "${product}" should not be a laptop or monitor`).to.be.false;
      });
    } else if (activeCategory === "Laptops") {
      currentProductNames.forEach(product => {
        const isPhone = productBelongsToCategory(product, phoneProducts);
        const isMonitor = productBelongsToCategory(product, monitorProducts);
        expect(isPhone || isMonitor, `Product "${product}" should not be a phone or monitor`).to.be.false;
      });
    } else if (activeCategory === "Monitors") {
      currentProductNames.forEach(product => {
        const isPhone = productBelongsToCategory(product, phoneProducts);
        const isLaptop = productBelongsToCategory(product, laptopProducts);
        expect(isPhone || isLaptop, `Product "${product}" should not be a phone or laptop`).to.be.false;
      });
    }
  });
});

Then("they should see the photo carousel", function() {
  cy.get('#carouselExampleIndicators').should('be.visible');
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    currentCarouselImage = $img.attr('src') || '';
  });
});

When("they click on the {string} button of the carousel", function(buttonType) {
  cy.get('#carouselExampleIndicators').should('be.visible');
  if (buttonType === "Next") {
    cy.get('.carousel-control-next').should('be.visible').click();
  } else if (buttonType === "Previous") {
    cy.get('.carousel-control-prev').should('be.visible').click();
  }
  cy.wait(1000);
});

Then("they should see the next image in the carousel", function() {
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    const newImage = $img.attr('src');
    expect(newImage).not.to.equal(currentCarouselImage);
    currentCarouselImage = newImage || '';
  });
});

Then("they should see the previous image in the carousel", function() {
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    const newImage = $img.attr('src');
    expect(newImage).not.to.equal(currentCarouselImage);
  });
}); 