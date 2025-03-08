Feature: Registro de usuarios

  Scenario: Registrar un nuevo usuario y iniciar sesión
    Given el usuario está en la página principal
    When registra un nuevo usuario
    And cierra la alerta de registro exitoso
    And inicia sesión con las credenciales del nuevo usuario
    Then debe acceder a la pantalla principal con el nuevo usuario
    
  Scenario: Intentar registrar un usuario ya existente
    Given el usuario está en la página principal
    When intenta registrar un usuario ya existente
    Then debe ver un mensaje indicando que el usuario ya existe 