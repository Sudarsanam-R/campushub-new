/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display the login form', () => {
    // Check if the login form is visible
    cy.get('h1').should('contain', 'Sign in to your account');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty form submission', () => {
    // Submit the form without filling in any fields
    cy.get('button[type="submit"]').click();

    // Check for validation errors
    cy.get('p.text-red-500').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    // Mock the login API call
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    // Fill in the form with invalid credentials
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Check for error message
    cy.wait('@loginRequest');
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should successfully log in with valid credentials', () => {
    // Mock the login API call
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 200,
      body: { success: true },
    }).as('loginRequest');

    // Mock the session API call
    cy.intercept('/api/auth/session', {
      statusCode: 200,
      body: { user: { email: 'test@example.com' } },
    }).as('sessionRequest');

    // Fill in the form with valid credentials
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check if the user is redirected to the dashboard
    cy.wait(['@loginRequest', '@sessionRequest']);
    cy.url().should('include', '/dashboard');
  });

  it('should have a link to the registration page', () => {
    cy.contains('a', 'Create an account').should('be.visible').click();
    cy.url().should('include', '/register');
  });

  it('should have a link to the forgot password page', () => {
    cy.contains('a', 'Forgot password?').should('be.visible').click();
    cy.url().should('include', '/forgot-password');
  });
});
