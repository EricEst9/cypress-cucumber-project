/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Reutilizamos el paso "el usuario está en la página principal" que ya está definido en contactAndAboutUs.steps.ts

// Productos por categoría para verificación
const phoneProducts = ["Samsung galaxy s6", "Nokia lumia 1520", "Nexus 6", "Samsung galaxy s7", "Iphone 6 32gb", "Sony xperia z5", "HTC One M9"];
const laptopProducts = ["Sony vaio i5", "Sony vaio i7", "MacBook air", "Dell i7 8gb", "2017 Dell 15.6 Inch", "MacBook Pro"];
const monitorProducts = ["Apple monitor 24", "ASUS Full HD"];

// Función auxiliar para verificar si un producto pertenece a una categoría
function productBelongsToCategory(productName: string, categoryProducts: string[]): boolean {
  return categoryProducts.some(categoryProduct => 
    productName.toLowerCase().includes(categoryProduct.toLowerCase())
  );
}

// Variable para almacenar la categoría actual
let currentCategory = "";

// Variable para almacenar información sobre el carrusel
let currentCarouselImage = '';

When("hace clic en la categoría {string}", function(categoryName: string) {
  // Esperar a que los productos se carguen en la página principal
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  
  // Mapear el nombre de la categoría al valor usado en el atributo onclick
  let categoryValue = '';
  if (categoryName === "Phones") {
    categoryValue = 'phone';
  } else if (categoryName === "Laptops") {
    categoryValue = 'notebook';
  } else if (categoryName === "Monitors") {
    categoryValue = 'monitor';
  }
  
  // Almacenar la categoría actual
  currentCategory = categoryName;
  
  // Hacer clic en la categoría usando el selector correcto
  cy.get(`[onclick="byCat('${categoryValue}')"]`).should('be.visible').click();
  
  // Esperar un momento para que se carguen los productos de la categoría seleccionada
  cy.wait(1000);
  
  // Verificar que los productos se han cargado después de hacer clic
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
});

Then("debe ver solo productos de la categoría {string}", function(categoryName: string) {
  // Verificar que estamos en la sección correcta
  cy.url().should('include', '/');
  
  // Esperar a que los productos se carguen
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  
  // Obtener los productos mostrados
  cy.get('.card-title').then($products => {
    const productNames: string[] = [];
    
    $products.each((index, element) => {
      productNames.push(Cypress.$(element).text().trim());
    });
    
    // Verificar que los productos mostrados pertenecen a la categoría seleccionada
    let expectedProducts: string[] = [];
    if (categoryName === "Phones") {
      expectedProducts = phoneProducts;
    } else if (categoryName === "Laptops") {
      expectedProducts = laptopProducts;
    } else if (categoryName === "Monitors") {
      expectedProducts = monitorProducts;
    }
    
    // Verificar que todos los productos mostrados están en la lista de productos esperados
    productNames.forEach(product => {
      const belongsToCategory = productBelongsToCategory(product, expectedProducts);
      expect(belongsToCategory, `El producto "${product}" debería pertenecer a la categoría ${categoryName}`).to.be.true;
    });
  });
});

Then("no debe ver productos de otras categorías", function() {
  // Usar la categoría almacenada
  const activeCategory = currentCategory;
  
  // Esperar a que los productos se carguen
  cy.get('.card-title').should('be.visible');
  cy.get('.card-title').should('have.length.at.least', 1);
  
  // Obtener los productos actuales
  cy.get('.card-title').then($currentProducts => {
    const currentProductNames: string[] = [];
    
    $currentProducts.each((index, element) => {
      currentProductNames.push(Cypress.$(element).text().trim());
    });
    
    // Verificar que no hay productos de otras categorías
    if (activeCategory === "Phones") {
      // No debe haber productos de portátiles ni monitores
      currentProductNames.forEach(product => {
        const isLaptop = productBelongsToCategory(product, laptopProducts);
        const isMonitor = productBelongsToCategory(product, monitorProducts);
        expect(isLaptop || isMonitor, `El producto "${product}" no debería ser un portátil o monitor`).to.be.false;
      });
    } else if (activeCategory === "Laptops") {
      // No debe haber productos de teléfonos ni monitores
      currentProductNames.forEach(product => {
        const isPhone = productBelongsToCategory(product, phoneProducts);
        const isMonitor = productBelongsToCategory(product, monitorProducts);
        expect(isPhone || isMonitor, `El producto "${product}" no debería ser un teléfono o monitor`).to.be.false;
      });
    } else if (activeCategory === "Monitors") {
      // No debe haber productos de teléfonos ni portátiles
      currentProductNames.forEach(product => {
        const isPhone = productBelongsToCategory(product, phoneProducts);
        const isLaptop = productBelongsToCategory(product, laptopProducts);
        expect(isPhone || isLaptop, `El producto "${product}" no debería ser un teléfono o portátil`).to.be.false;
      });
    }
  });
});

Then("debe ver el carrusel de fotos", function() {
  // Verificar que el carrusel está visible
  cy.get('#carouselExampleIndicators').should('be.visible');
  
  // Verificar que hay al menos una imagen activa en el carrusel
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    // Almacenar la URL de la imagen actual para comparar después
    currentCarouselImage = $img.attr('src');
  });
});

When("hace clic en el botón {string} del carrusel", function(buttonType) {
  // Esperar a que el carrusel esté visible
  cy.get('#carouselExampleIndicators').should('be.visible');
  
  if (buttonType === "Next") {
    // Hacer clic en el botón "Next" del carrusel
    cy.get('.carousel-control-next').should('be.visible').click();
  } else if (buttonType === "Previous") {
    // Hacer clic en el botón "Previous" del carrusel
    cy.get('.carousel-control-prev').should('be.visible').click();
  }
  
  // Esperar a que la transición del carrusel termine
  cy.wait(1000);
});

Then("debe ver la siguiente imagen del carrusel", function() {
  // Verificar que la imagen ha cambiado después de hacer clic en "Next"
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    const newImage = $img.attr('src');
    
    // Verificar que la imagen ha cambiado
    expect(newImage).not.to.equal(currentCarouselImage);
    
    // Actualizar la imagen actual para la siguiente comparación
    currentCarouselImage = newImage;
  });
});

Then("debe ver la imagen anterior del carrusel", function() {
  // Verificar que la imagen ha cambiado después de hacer clic en "Previous"
  cy.get('.carousel-item.active img').should('be.visible').then($img => {
    const newImage = $img.attr('src');
    
    // Verificar que la imagen ha cambiado
    expect(newImage).not.to.equal(currentCarouselImage);
    
    // No actualizamos currentCarouselImage aquí porque no lo necesitamos para más comparaciones
  });
}); 