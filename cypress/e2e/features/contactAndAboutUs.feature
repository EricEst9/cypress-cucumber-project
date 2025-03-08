Feature: Navegación por Contact y About us

  Scenario: Usuario navega a la página de Contact y envía un mensaje
    Given el usuario está en la página principal
    When hace clic en el enlace "Contact" del header
    Then debe ver el modal de contacto
    And el modal debe contener un formulario de contacto
    When completa el formulario de contacto con datos válidos
    And hace clic en el botón "Send message"
    Then debe recibir confirmación de que el mensaje se ha enviado
    # El modal se cierra automáticamente después de enviar el mensaje

  Scenario: Usuario navega a la página de About us
    Given el usuario está en la página principal
    When hace clic en el enlace "About us" del header
    Then debe ver el modal de About us
    And el modal debe contener un video
    And debe mostrar un mensaje de error si el video no se puede cargar
    And el modal debe cerrarse al hacer clic en el botón Close 