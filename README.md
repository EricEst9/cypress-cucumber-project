# Cypress Cucumber E2E Testing Project

Este proyecto contiene pruebas end-to-end para la aplicación web de comercio electrónico [demoblaze.com](https://www.demoblaze.com) utilizando Cypress y Cucumber.

## Características

- Tests escritos en formato Gherkin utilizando Cucumber
- Implementación en TypeScript
- Comandos personalizados de Cypress
- Patrones Page Object y módulos de utilidades
- Soporte para múltiples escenarios y categorías de pruebas

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)
- Git

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cypress-cucumber-project.git
   cd cypress-cucumber-project
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Estructura del Proyecto

```
cypress/
├── e2e/
│   ├── features/                 # Archivos .feature (Gherkin)
│   │   ├── categoriesFilters.feature
│   │   ├── checkout.feature
│   │   ├── contactAndAboutUs.feature
│   │   ├── login.feature
│   │   └── signup.feature
│   └── step_definitions/        # Implementaciones de los pasos
│       ├── common.steps.ts      # Pasos comunes compartidos
│       ├── categoriesFilters.steps.ts
│       ├── checkout.steps.ts
│       ├── contactAndAboutUs.steps.ts
│       ├── login.steps.ts
│       ├── signup.steps.ts
│       └── index.ts             # Importa todos los archivos de pasos
├── fixtures/                    # Datos de prueba
│   └── users.json
└── support/                     # Código de soporte y utilidades
    ├── cart.ts                  # Funciones relacionadas con el carrito
    ├── commands.ts              # Comandos personalizados de Cypress
    ├── e2e.ts                   # Configuración global de Cypress
    └── utils.ts                 # Funciones de utilidad
```

## Configuración

El proyecto está configurado para ejecutar pruebas contra [demoblaze.com](https://www.demoblaze.com) como URL base. La configuración principal está en `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    setupNodeEvents,
    specPattern: "cypress/e2e/features/*.feature",
    baseUrl: "https://www.demoblaze.com",
    supportFile: "cypress/support/e2e.ts"
  },
});
```

## Ejecución de Pruebas

### Abrir la Interfaz de Cypress

```bash
npm run cypress:open
```

### Ejecutar todos los tests en modo headless

```bash
npm run cypress:run
```

### Ejecutar un feature específico

```bash
npm run cypress:run -- --spec "cypress/e2e/features/login.feature"
```

## Escenarios de Prueba

El proyecto incluye los siguientes escenarios de prueba:

### Navegación por Categorías
- Navegar por categoría de teléfonos
- Navegar por categoría de portátiles
- Navegar por categoría de monitores
- Funcionamiento del carrusel de fotos

### Proceso de Compra
- Flujo completo de compra (añadir productos, checkout)
- Verificación de totales y cantidades
- Formulario de checkout

### Login y Registro
- Inicio de sesión con credenciales válidas
- Inicio de sesión con usuario inexistente
- Registro de nuevo usuario
- Intento de registro con usuario existente

### Contacto y About Us
- Navegación a la sección de contacto
- Envío de mensajes de contacto
- Visualización del modal de About us

### Verificación de Estado de Páginas
- Verificación de códigos de estado HTTP (200 o 30x) para todos los enlaces en la página principal
- Comprobación de que ningún enlace devuelve códigos de error 40x

## Comandos Personalizados

El proyecto incluye varios comandos personalizados de Cypress para simplificar los tests:

- `cy.visitHomePage()` - Visita la página principal
- `cy.visitCart()` - Visita la página del carrito
- `cy.addProductToCart(index, quantity)` - Añade productos al carrito
- `cy.removeProductFromCart(productName)` - Elimina productos del carrito
- `cy.login(username, password)` - Inicia sesión
- `cy.verifyProductInCart(productName)` - Verifica productos en el carrito
- `cy.fillCheckoutForm(userData)` - Rellena el formulario de checkout

## Estructura de Cucumber

Las definiciones de pasos se configuran en el `package.json`:

```json
"cypress-cucumber-preprocessor": {
  "stepDefinitions": [
    "cypress/e2e/step_definitions/**/*.{js,ts}"
  ]
}
```

## Recursos Adicionales

- [Documentación de Cypress](https://docs.cypress.io/)
- [Documentación de Cucumber](https://cucumber.io/docs/cucumber/)
- [Plugin de Cucumber para Cypress](https://github.com/badeball/cypress-cucumber-preprocessor)