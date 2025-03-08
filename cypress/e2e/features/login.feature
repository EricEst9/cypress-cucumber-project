Feature: Inicio de sesión

  Scenario: Usuario intenta iniciar sesión con usuario inexistente
    Given el usuario está en la página principal
    When ingresa un nombre de usuario que no existe
    Then debe ver un mensaje indicando que el usuario no existe
    And la respuesta HTTP debe tener código 200

  Scenario: Usuario inicia sesión con credenciales válidas y cierra sesión
    Given el usuario está en la página principal
    When ingresa credenciales válidas
    Then debe acceder a la pantalla principal
    And debe ver su nombre de usuario en la barra de navegación
    When cierra la sesión
    Then debe volver a la página principal sin estar autenticado
