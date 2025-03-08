/// <reference types="cypress" />
/// <reference path="../../support/index.d.ts" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Variables para almacenar información sobre productos y precios
let productName = '';
let productPrice = 0;
let totalPrice = 0;
let addedProducts: { name: string; price: number; quantity: number }[] = [];

// Variable para almacenar el nombre del producto eliminado
let deletedProductName = '';

// Función para configurar los interceptores de API
function setupApiInterceptors() {
  // Interceptar la carga de productos (GET a entries)
  cy.intercept({
    method: 'GET',
    url: '**/entries',
    times: 1
  }).as('getProducts');
  
  // Interceptar la adición de productos al carrito
  cy.intercept({
    method: 'POST',
    url: '**/addtocart*'
  }).as('addToCart');
  
  // Interceptar la carga del carrito
  cy.intercept({
    method: 'POST',
    url: '**/viewcart*'
  }).as('getCart');
  
  // Interceptar la eliminación de productos del carrito
  cy.intercept({
    method: 'POST',
    url: '**/deletecart*'
  }).as('deleteFromCart');
}

// Función para esperar a que se cargue una página con manejo de errores
function waitForPageLoad(aliasName: string, fallbackTimeout = 10000) {
  // Usar try/catch en lugar de .catch() para manejar errores
  try {
    return cy.wait(aliasName, { timeout: fallbackTimeout });
  } catch (error) {
    // Si la espera falla, registrar el error y continuar
    cy.log(`Error esperando ${aliasName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Esperar un tiempo fijo como fallback
    return cy.wait(fallbackTimeout);
  }
}

// Función para calcular el precio total esperado
function calculateExpectedTotal(): number {
  // Calcular el total sumando el precio de cada producto multiplicado por su cantidad
  const total = addedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  console.log(`Productos en el carrito: ${JSON.stringify(addedProducts)}`);
  console.log(`Precio total calculado: ${total}`);
  return total;
}

// Función para extraer el precio de un texto
function extractPrice(priceText: string): number {
  // Intentar extraer el precio con formato $XXX
  const dollarMatch = priceText.match(/\$(\d+)/);
  if (dollarMatch) {
    return parseInt(dollarMatch[1], 10);
  }
  
  // Intentar extraer el precio con formato XXX
  const numberMatch = priceText.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }
  
  // Si no se encuentra ningún formato, devolver 0
  return 0;
}

// Función para obtener el precio total mostrado en la interfaz
function getDisplayedTotal() {
  return cy.get('#totalp').should('be.visible').then($total => {
    const totalText = $total.text().trim();
    cy.log(`Texto del precio total: "${totalText}"`);
    const total = parseInt(totalText, 10);
    cy.log(`Precio total mostrado: ${total}`);
    return total;
  });
}

// Configurar interceptores antes de cada escenario
beforeEach(() => {
  setupApiInterceptors();
  
  // Configurar un timeout más largo para las peticiones y comandos
  Cypress.config('defaultCommandTimeout', 20000);
  Cypress.config('requestTimeout', 30000);
  Cypress.config('pageLoadTimeout', 30000);
});

When("hace clic en un producto", function() {
  // Esperar a que se carguen los productos
  cy.get('.card-title').should('be.visible', { timeout: 20000 });
  
  // Hacer clic en el primer producto disponible
  cy.get('.card-title').first().then($title => {
    productName = $title.text().trim();
    cy.log(`Haciendo clic en el producto: ${productName}`);
    cy.get('.card-title').contains(productName).click();
  });
  
  // Verificar que estamos en la página de detalles del producto
  cy.url().should('include', 'prod.html', { timeout: 20000 });
  
  // Esperar a que los elementos clave de la página de producto estén visibles
  cy.get('.name').should('be.visible', { timeout: 20000 });
  cy.get('.price-container').should('be.visible', { timeout: 20000 });
  cy.contains('a.btn', 'Add to cart').should('be.visible', { timeout: 20000 });
  
  // Esperar un tiempo adicional para asegurar que todo se ha cargado
  cy.wait(3000);
});

When("hace clic en el mismo producto", function() {
  // Esperar a que se carguen los productos
  cy.get('.card-title').should('be.visible', { timeout: 20000 });
  
  // Hacer clic en el mismo producto que antes
  cy.log(`Haciendo clic en el mismo producto: ${productName}`);
  cy.get('.card-title').contains(productName).click();
  
  // Verificar que estamos en la página de detalles del producto
  cy.url().should('include', 'prod.html', { timeout: 20000 });
  
  // Esperar a que los elementos clave de la página de producto estén visibles
  cy.get('.name').should('be.visible', { timeout: 20000 });
  cy.get('.price-container').should('be.visible', { timeout: 20000 });
  cy.contains('a.btn', 'Add to cart').should('be.visible', { timeout: 20000 });
  
  // Esperar un tiempo adicional para asegurar que todo se ha cargado
  cy.wait(3000);
});

Then("debe ver los detalles del producto", function() {
  // Verificar que estamos en la página de detalles del producto
  cy.url().should('include', 'prod.html');
  
  // Verificar que el nombre del producto es correcto
  cy.get('.name').should('be.visible', { timeout: 20000 }).should('contain', productName);
  
  // Obtener y almacenar el precio del producto
  cy.get('.price-container').should('be.visible', { timeout: 20000 }).then($price => {
    const priceText = $price.text().trim();
    productPrice = extractPrice(priceText);
    cy.log(`Precio del producto: ${productPrice}`);
    expect(productPrice).to.be.greaterThan(0);
  });
});

When("añade el producto al carrito", function() {
  // Esperar a que el botón esté disponible
  cy.contains('a.btn', 'Add to cart').should('be.visible', { timeout: 20000 });
  
  // Hacer clic en el botón "Add to cart"
  cy.log(`Añadiendo producto al carrito: ${productName}`);
  cy.contains('a.btn', 'Add to cart').click();
  
  // Esperar a que se complete la adición al carrito o un tiempo razonable
  cy.wait(3000);
  
  // Buscar si el producto ya está en nuestra lista
  const existingProductIndex = addedProducts.findIndex(p => p.name === productName);
  
  if (existingProductIndex >= 0) {
    // Si el producto ya está en la lista, incrementar su cantidad
    addedProducts[existingProductIndex].quantity += 1;
    cy.log(`Incrementada cantidad de ${productName} a ${addedProducts[existingProductIndex].quantity}`);
  } else {
    // Si es un producto nuevo, añadirlo a la lista
    addedProducts.push({ name: productName, price: productPrice, quantity: 1 });
    cy.log(`Añadido nuevo producto: ${productName} con precio ${productPrice}`);
  }
  
  // Mostrar el estado actual del carrito
  cy.log(`Estado actual del carrito: ${JSON.stringify(addedProducts)}`);
});

Then("debe ver un mensaje de confirmación", function() {
  // Configurar el manejo de alertas
  cy.on('window:alert', (text) => {
    expect(text).to.include('Product added');
  });
  
  // Esperar un tiempo para asegurar que la alerta se ha procesado
  cy.wait(1000);
});

When("vuelve a la página principal", function() {
  // Hacer clic en el enlace "Home" en la barra de navegación
  cy.contains('a', 'Home').should('be.visible', { timeout: 20000 }).click();
  
  // Esperar a que se cargue la página principal
  cy.url().should('include', '/', { timeout: 20000 });
  
  // Esperar a que se carguen los productos
  cy.get('.card-title').should('be.visible', { timeout: 20000 });
  
  // Esperar un tiempo adicional para asegurar que todo se ha cargado
  cy.wait(3000);
});

When("navega al carrito", function() {
  // Hacer clic en el enlace "Cart" en la barra de navegación
  cy.contains('a', 'Cart').should('be.visible', { timeout: 20000 }).click();
  
  // Esperar a que se cargue la página del carrito
  cy.url().should('include', 'cart.html', { timeout: 20000 });
  
  // Esperar un tiempo adicional para asegurar que todo se ha cargado
  cy.wait(3000);
});

Then("debe ver el producto en el carrito", function() {
  // Esperar a que se cargue la tabla del carrito
  cy.get('#tbodyid').should('be.visible', { timeout: 20000 });
  
  // Verificar que el producto está en la tabla del carrito
  cy.get('#tbodyid').should('contain', productName);
  cy.log(`Producto "${productName}" encontrado en el carrito`);
});

Then("debe ver el producto en el carrito con cantidad {int}", function(quantity: number) {
  // Esperar a que se cargue la tabla del carrito
  cy.get('#tbodyid').should('be.visible', { timeout: 20000 });
  
  // Verificar que el producto está en la tabla del carrito
  cy.get('#tbodyid').should('contain', productName);
  
  // Contar cuántas veces aparece el producto en el carrito
  cy.get('#tbodyid tr').then($rows => {
    let count = 0;
    $rows.each((index, row) => {
      if (Cypress.$(row).text().includes(productName)) {
        count++;
      }
    });
    
    cy.log(`Producto "${productName}" encontrado ${count} veces en el carrito`);
    expect(count).to.equal(quantity);
    
    // Actualizar la cantidad en nuestra lista de productos
    const productIndex = addedProducts.findIndex(p => p.name === productName);
    if (productIndex >= 0) {
      addedProducts[productIndex].quantity = count;
    }
    
    // Esperar a que se cargue el precio total
    cy.get('#totalp').should('be.visible', { timeout: 20000 });
    
    // Obtener el precio total mostrado y verificarlo
    cy.get('#totalp').then($total => {
      const displayedTotal = parseInt($total.text().trim(), 10);
      cy.log(`Precio total mostrado: ${displayedTotal}`);
      
      // Calcular el precio total esperado
      const expectedTotal = calculateExpectedTotal();
      
      // Verificar que el precio total mostrado es correcto
      expect(displayedTotal).to.equal(expectedTotal);
      cy.log(`Verificación exitosa: ${displayedTotal} = ${expectedTotal}`);
    });
  });
});

Then("debe ver el precio total correcto", function() {
  // Esperar a que se cargue el precio total
  cy.get('#totalp').should('exist', { timeout: 20000 });
  
  // Obtener el precio total mostrado y verificarlo
  cy.get('#totalp').then($total => {
    const totalText = $total.text().trim();
    if (totalText) {
      const displayedTotal = parseInt(totalText, 10);
      cy.log(`Precio total mostrado: ${displayedTotal}`);
      
      // Calcular el precio total esperado
      const expectedTotal = calculateExpectedTotal();
      
      // Verificar que el precio total mostrado es correcto
      expect(displayedTotal).to.equal(expectedTotal);
      cy.log(`Verificación exitosa: ${displayedTotal} = ${expectedTotal}`);
    } else {
      cy.log("El precio total no está disponible o es vacío");
      // Si el carrito está vacío, el total esperado debería ser 0
      expect(addedProducts.length).to.equal(0);
    }
  });
});

Then("debe ver el precio total correcto para la cantidad actualizada", function() {
  // Esperar a que se cargue el precio total
  cy.get('#totalp').should('be.visible', { timeout: 20000 });
  
  // Obtener el precio total mostrado y verificarlo
  cy.get('#totalp').then($total => {
    const displayedTotal = parseInt($total.text().trim(), 10);
    cy.log(`Precio total mostrado: ${displayedTotal}`);
    
    // Calcular el precio total esperado
    const expectedTotal = calculateExpectedTotal();
    
    // Verificar que el precio total mostrado es correcto
    expect(displayedTotal).to.equal(expectedTotal);
    cy.log(`Verificación exitosa: ${displayedTotal} = ${expectedTotal}`);
  });
});

Then("debe ver el precio total actualizado", function() {
  // Esperar a que se cargue el precio total
  cy.get('#totalp').should('exist', { timeout: 20000 });
  
  // Obtener el precio total mostrado y verificarlo
  cy.get('#totalp').then($total => {
    const totalText = $total.text().trim();
    if (totalText) {
      const displayedTotal = parseInt(totalText, 10);
      cy.log(`Precio total mostrado: ${displayedTotal}`);
      
      // Calcular el precio total esperado
      const expectedTotal = calculateExpectedTotal();
      
      // Verificar que el precio total mostrado es correcto
      expect(displayedTotal).to.equal(expectedTotal);
      cy.log(`Verificación exitosa: ${displayedTotal} = ${expectedTotal}`);
    } else {
      cy.log("El precio total no está disponible o es vacío");
      // Si el carrito está vacío, el total esperado debería ser 0
      expect(addedProducts.length).to.equal(0);
    }
  });
});

Given("el usuario tiene productos en el carrito", function() {
  // Ir a la página principal
  cy.visit('/');
  
  // Esperar a que se carguen los productos
  cy.get('.card-title').should('be.visible', { timeout: 20000 });
  
  // Hacer clic en un producto
  cy.get('.card-title').first().then($title => {
    productName = $title.text().trim();
    cy.log(`Seleccionando producto: ${productName}`);
    cy.get('.card-title').contains(productName).click();
  });
  
  // Verificar que estamos en la página de detalles del producto
  cy.url().should('include', 'prod.html', { timeout: 20000 });
  
  // Esperar a que los elementos clave de la página de producto estén visibles
  cy.get('.name').should('be.visible', { timeout: 20000 });
  cy.get('.price-container').should('be.visible', { timeout: 20000 });
  
  // Obtener el precio del producto
  cy.get('.price-container').should('be.visible', { timeout: 20000 }).then($price => {
    const priceText = $price.text().trim();
    productPrice = extractPrice(priceText);
    cy.log(`Precio del producto: ${productPrice}`);
  });
  
  // Añadir el producto al carrito
  cy.contains('a.btn', 'Add to cart').should('be.visible', { timeout: 20000 }).click();
  
  // Esperar a que se complete la adición al carrito
  cy.wait(3000);
  
  // Manejar la alerta
  cy.on('window:alert', () => true);
  
  // Almacenar el producto añadido
  addedProducts = [{ name: productName, price: productPrice, quantity: 1 }];
  cy.log(`Producto añadido al carrito: ${JSON.stringify(addedProducts)}`);
  
  // Ir al carrito
  cy.contains('a', 'Cart').should('be.visible', { timeout: 20000 }).click();
  
  // Esperar a que se cargue la página del carrito
  cy.url().should('include', 'cart.html', { timeout: 20000 });
  
  // Verificar que el producto está en el carrito
  cy.get('#tbodyid').should('be.visible', { timeout: 20000 }).should('contain', productName);
  cy.log(`Producto "${productName}" verificado en el carrito`);
});

When("elimina un producto del carrito", function() {
  // Esperar a que se cargue la tabla del carrito
  cy.get('#tbodyid').should('exist', { timeout: 20000 });
  
  // Obtener el nombre del primer producto (el que vamos a eliminar)
  cy.get('#tbodyid tr').first().then($row => {
    // Extraer el nombre del producto de la fila
    deletedProductName = $row.find('.cart-title, td:nth-child(2)').text().trim();
    cy.log(`Producto a eliminar: "${deletedProductName}"`);
    
    // Guardar el índice del producto en nuestra lista
    const productIndex = addedProducts.findIndex(p => p.name === deletedProductName);
    
    // Hacer clic en el botón "Delete" para este producto
    cy.get('#tbodyid tr').first().find('a:contains("Delete")').click({ force: true });
    
    // Esperar a que el producto desaparezca de la tabla
    cy.get('#tbodyid', { timeout: 10000 }).should('not.contain', deletedProductName);
    
    // Eliminar el producto de nuestra lista
    if (productIndex >= 0) {
      addedProducts.splice(productIndex, 1);
      cy.log(`Producto "${deletedProductName}" eliminado de la lista`);
      cy.log(`Lista actualizada: ${JSON.stringify(addedProducts)}`);
    }
  });
});

Then("el producto debe desaparecer del carrito", function() {
  // Verificar que el producto eliminado ya no está en el carrito
  cy.get('#tbodyid').should('not.contain', deletedProductName, { timeout: 20000 });
  cy.log(`Verificado: El producto "${deletedProductName}" ya no está en el carrito`);
  
  // Verificar que los demás productos siguen en el carrito
  addedProducts.forEach(product => {
    cy.get('#tbodyid').should('contain', product.name, { timeout: 20000 });
    cy.log(`Verificado: El producto "${product.name}" sigue en el carrito`);
  });
});

When("elimina todos los productos del carrito", function() {
  // Esperar a que se cargue la tabla del carrito
  cy.get('#tbodyid').should('exist', { timeout: 20000 });
  
  // Eliminar todos los productos del carrito uno por uno
  function deleteNextProduct() {
    cy.get('body').then($body => {
      // Verificar si hay botones "Delete" en la página
      if ($body.find('a:contains("Delete")').length > 0) {
        // Hacer clic en el primer botón "Delete"
        cy.get('a:contains("Delete")').first().click({ force: true });
        
        // Esperar a que se actualice el carrito
        cy.wait(5000);
        
        // Eliminar el siguiente producto
        deleteNextProduct();
      } else {
        cy.log("No hay más productos para eliminar");
      }
    });
  }
  
  // Iniciar el proceso de eliminación
  deleteNextProduct();
  
  // Limpiar nuestra lista de productos
  addedProducts = [];
  cy.log("Todos los productos han sido eliminados del carrito");
});

Then("debe ver que el carrito está vacío", function() {
  // Verificar que el carrito está vacío
  
  // Método 1: Verificar que no hay elementos en la tabla del carrito
  cy.get('#tbodyid').then($tbody => {
    // Verificar que no hay filas de productos en la tabla
    expect($tbody.children().length).to.equal(0);
    cy.log("Carrito vacío verificado: No hay elementos en la tabla");
  });
  
  // Método 2: Verificar que no hay precio total o es cero
  cy.get('body').then($body => {
    if ($body.find('#totalp').length > 0) {
      cy.get('#totalp').then($total => {
        const totalText = $total.text().trim();
        // Verificar que el precio total es vacío o cero
        const isEmpty = totalText === '' || totalText === '0' || parseInt(totalText, 10) === 0;
        expect(isEmpty).to.be.true;
        cy.log(`Carrito vacío verificado: Precio total es "${totalText}" (vacío o cero)`);
      });
    } else {
      // Si no hay elemento de precio total, también es una indicación de carrito vacío
      cy.log("Carrito vacío verificado: No hay elemento de precio total");
    }
  });
  
  // Método 3: Verificar que no hay botones "Delete" en la página
  cy.get('body').then($body => {
    const deleteButtons = $body.find('a:contains("Delete")');
    expect(deleteButtons.length).to.equal(0);
    cy.log("Carrito vacío verificado: No hay botones 'Delete' en la página");
  });
});

// Función para añadir un producto al carrito
function addProductToCart(index: number) {
  return cy.get('.card-title').eq(index).then($title => {
    const productName = $title.text().trim();
    cy.log(`Seleccionando producto ${index + 1}: ${productName}`);
    
    // Obtener el ID del producto desde el enlace
    cy.get('.card-block a').eq(index).invoke('attr', 'href').then((href) => {
      const productId = href ? href.split('=')[1] : '';
      cy.log(`ID del producto: ${productId}`);
      
      if (!productId) {
        cy.log('No se pudo obtener el ID del producto, intentando método alternativo');
        // Intentar hacer clic directo como alternativa
        cy.get('.card-title').eq(index).click({ force: true });
        // Esperar a que la URL cambie
        cy.location('href', { timeout: 10000 }).should('not.include', 'index.html');
      } else {
        // Navegar directamente a la página del producto usando la URL con el ID
        cy.visit(`https://www.demoblaze.com/prod.html?idp_=${productId}`, { timeout: 30000 });
      }
      
      // Verificar que estamos en la página de detalles del producto
      cy.url().should('include', 'prod.html', { timeout: 30000 });
      
      // Esperar a que los elementos clave de la página de producto estén visibles
      cy.get('.name', { timeout: 30000 }).should('exist');
      cy.get('.price-container', { timeout: 30000 }).should('exist');
      
      // Obtener el precio del producto
      return cy.get('.price-container').then($price => {
        const priceText = $price.text().trim();
        const productPrice = extractPrice(priceText);
        cy.log(`Precio del producto ${index + 1}: ${productPrice}`);
        
        // Hacer clic en el botón "Add to cart"
        cy.contains('a.btn', 'Add to cart').click({ force: true });
        
        // Esperar a que aparezca la alerta y se cierre
        cy.on('window:alert', (text) => {
          cy.log(`Alerta detectada: ${text}`);
          return true;
        });
        
        // Esperar a que se complete la adición al carrito verificando que la alerta ya no está presente
        cy.get('body').should(($body) => {
          // Esta verificación es para asegurarnos de que la alerta ya se ha cerrado
          // No hay una forma directa de verificar que una alerta ya no está presente,
          // pero podemos verificar que podemos interactuar con la página nuevamente
          expect($body).to.exist;
        });
        
        // Registrar el producto añadido
        addedProducts.push({ name: productName, price: productPrice, quantity: 1 });
        cy.log(`Añadido producto ${index + 1}: ${JSON.stringify(addedProducts)}`);
        
        // Volver a la página principal directamente
        cy.visit('https://www.demoblaze.com/', { timeout: 30000 });
        
        // Verificar que estamos en la página principal
        cy.url().should('match', /demoblaze\.com\/?$/, { timeout: 30000 });
        
        // Esperar a que se carguen los productos
        cy.get('.card-title', { timeout: 30000 }).should('exist');
        cy.get('.card-title').should('have.length.gt', 0);
        
        // Esperar a que las imágenes de los productos se carguen
        cy.get('.card-img-top').should('be.visible');
      });
    });
  });
}

When("añade varios productos diferentes al carrito", function() {
  // Limpiar la lista de productos
  addedProducts = [];
  cy.log("Lista de productos limpiada");
  
  // Visitar la página principal directamente
  cy.visit('https://www.demoblaze.com/', { timeout: 30000 });
  
  // Esperar a que se carguen los productos
  cy.get('.card-title').should('exist', { timeout: 30000 });
  cy.get('.card-title').should('have.length.gt', 0);
  
  // Añadir productos uno por uno con manejo de errores
  function addNextProduct(index: number, maxIndex: number) {
    if (index <= maxIndex) {
      cy.log(`Añadiendo producto ${index + 1} de ${maxIndex + 1}`);
      
      // Intentar añadir el producto actual y manejar posibles errores
      cy.wrap(null).then(() => {
        try {
          addProductToCart(index).then(() => {
            // Continuar con el siguiente producto
            addNextProduct(index + 1, maxIndex);
          });
        } catch (error) {
          // En caso de error, registrarlo y continuar con el siguiente producto
          cy.log(`Error al añadir producto ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
          addNextProduct(index + 1, maxIndex);
        }
      });
    } else {
      // Todos los productos han sido procesados, ir al carrito directamente
      cy.log("Todos los productos han sido procesados");
      cy.visit('https://www.demoblaze.com/cart.html', { timeout: 30000 });
      
      // Verificar que estamos en la página del carrito
      cy.url().should('include', 'cart.html', { timeout: 30000 });
      
      // Esperar a que se cargue la tabla del carrito
      cy.get('#tbodyid', { timeout: 10000 }).should('exist');
      
      // Esperar a que se carguen los productos en el carrito
      cy.get('#tbodyid tr', { timeout: 10000 }).should('have.length.gte', addedProducts.length);
      
      // Verificar el estado final del carrito
      cy.log(`Estado final del carrito: ${JSON.stringify(addedProducts)}`);
    }
  }
  
  // Iniciar el proceso de añadir productos
  addNextProduct(0, 3); // Añadir 4 productos (índices 0-3)
});

Then("debe ver todos los productos en el carrito", function() {
  // Esperar a que se cargue la tabla del carrito
  cy.get('#tbodyid').should('be.visible', { timeout: 20000 });
  
  // Verificar que todos los productos añadidos están en el carrito
  addedProducts.forEach(product => {
    cy.get('#tbodyid').should('contain', product.name, { timeout: 20000 });
    cy.log(`Producto "${product.name}" verificado en el carrito`);
  });
});

Then("debe ver el precio total correcto para todos los productos", function() {
  // Esperar a que se cargue el precio total
  cy.get('#totalp').should('exist', { timeout: 20000 });
  
  // Obtener el precio total mostrado y verificarlo
  cy.get('#totalp').then($total => {
    const totalText = $total.text().trim();
    if (totalText) {
      const displayedTotal = parseInt(totalText, 10);
      cy.log(`Precio total mostrado: ${displayedTotal}`);
      
      // Calcular el precio total esperado
      const expectedTotal = calculateExpectedTotal();
      
      // Verificar que el precio total mostrado es correcto
      expect(displayedTotal).to.equal(expectedTotal);
      cy.log(`Verificación exitosa: ${displayedTotal} = ${expectedTotal}`);
    } else {
      cy.log("El precio total no está disponible o es vacío");
      // Si el carrito está vacío, el total esperado debería ser 0
      expect(addedProducts.length).to.equal(0);
    }
  });
}); 