// Type definitions for custom Cypress commands
// This file contains type definitions for your custom Cypress commands

declare namespace Cypress {
  interface Chainable<Subject = any> {
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
