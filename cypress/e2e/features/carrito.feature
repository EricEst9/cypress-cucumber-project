Feature: Funcionalidad del carrito de compras

  Scenario: Verificar carrito vacío al inicio
    Given el usuario está en la página principal
    When navega al carrito
    Then debe ver que el carrito está vacío

  Scenario: Añadir productos al carrito y verificar el total
    Given el usuario está en la página principal
    When hace clic en un producto
    Then debe ver los detalles del producto
    When añade el producto al carrito
    Then debe ver un mensaje de confirmación
    When navega al carrito
    Then debe ver el producto en el carrito
    And debe ver el precio total correcto

  Scenario: Añadir el mismo producto dos veces al carrito
    Given el usuario está en la página principal
    When hace clic en un producto
    Then debe ver los detalles del producto
    When añade el producto al carrito
    Then debe ver un mensaje de confirmación
    When vuelve a la página principal
    And hace clic en el mismo producto
    Then debe ver los detalles del producto
    When añade el producto al carrito
    Then debe ver un mensaje de confirmación
    When navega al carrito
    Then debe ver el producto en el carrito con cantidad 2
    And debe ver el precio total correcto para la cantidad actualizada

  Scenario: Añadir múltiples productos y eliminarlos del carrito
    Given el usuario está en la página principal
    When añade varios productos diferentes al carrito
    Then debe ver todos los productos en el carrito
    And debe ver el precio total correcto para todos los productos
    When elimina un producto del carrito
    Then el producto debe desaparecer del carrito
    And debe ver el precio total actualizado
    When elimina todos los productos del carrito
    Then debe ver que el carrito está vacío

  Scenario: Añadir múltiples productos diferentes al carrito
    Given el usuario está en la página principal
    When añade varios productos diferentes al carrito
    Then debe ver todos los productos en el carrito
    And debe ver el precio total correcto para todos los productos 