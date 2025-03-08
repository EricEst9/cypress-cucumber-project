module.exports = {
  default: {
    paths: ['cypress/e2e/features/*.feature'],
    require: ['cypress/e2e/step_definitions/**/*.js'],
    requireModule: ['@badeball/cypress-cucumber-preprocessor/register'],
    format: ['json:cypress/cucumber-json/cucumber-report.json'],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
}; 