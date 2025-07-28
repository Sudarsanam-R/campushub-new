// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add testing-library commands
import '@testing-library/cypress/add-commands';

// General error handling
Cypress.on('uncaught:exception', (err) => {
  console.error('Uncaught exception in test:', err);
  // Return false to prevent the error from failing the test
  return false;
});

// Add custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(`${password}{enter}`);
    // Wait for the login to complete
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Sign out').click();
  cy.url().should('include', '/login');
});

// Command to check for a11y violations
Cypress.Commands.add('checkA11y', () => {
  // This is a placeholder for a11y testing
  // You would typically integrate with cypress-axe here
  cy.injectAxe();
  cy.checkA11y();
});

// Command to wait for API calls to complete
Cypress.Commands.add('waitForApiCalls', () => {
  // This is a placeholder that you can customize based on your API calls
  // For example, if you're using cy.intercept() to spy on API calls
  cy.wait('@someApiCall');
});
