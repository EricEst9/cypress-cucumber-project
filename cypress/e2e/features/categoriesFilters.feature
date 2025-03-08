Feature: Navegación por categorías y productos

  Scenario: Usuario navega por la categoría de teléfonos
    Given el usuario está en la página principal
    When hace clic en la categoría "Phones"
    Then debe ver solo productos de la categoría "Phones"
    And no debe ver productos de otras categorías

  Scenario: Usuario navega por la categoría de portátiles
    Given el usuario está en la página principal
    When hace clic en la categoría "Laptops"
    Then debe ver solo productos de la categoría "Laptops"
    And no debe ver productos de otras categorías

  Scenario: Usuario navega por la categoría de monitores
    Given el usuario está en la página principal
    When hace clic en la categoría "Monitors"
    Then debe ver solo productos de la categoría "Monitors"
    And no debe ver productos de otras categorías
    
  Scenario: El carrusel de fotos funciona correctamente
    Given el usuario está en la página principal
    Then debe ver el carrusel de fotos
    When hace clic en el botón "Next" del carrusel
    Then debe ver la siguiente imagen del carrusel
    When hace clic en el botón "Previous" del carrusel
    Then debe ver la imagen anterior del carrusel 