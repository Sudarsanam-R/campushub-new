// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import './commands';
import '@testing-library/cypress/add-commands';

// Extend Cypress types
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to log out the current user
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to wait for API calls to complete
       * @example cy.waitForApiCalls()
       */
      waitForApiCalls(): Chainable<void>;
    }
  }
}

// General error handling
Cypress.on('uncaught:exception', (err) => {
  console.error('Uncaught exception in test:', err);
  // Return false to prevent the error from failing the test
  return false;
});

// Add custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
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

// Command to wait for API calls to complete
Cypress.Commands.add('waitForApiCalls', () => {
  // This is a placeholder that you can customize based on your API calls
  // For example, if you're using cy.intercept() to spy on API calls
  cy.log('Waiting for API calls to complete');
});
