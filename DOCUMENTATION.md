# CampusHub Documentation

This document provides an overview of the documentation system used in the CampusHub project.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [Code Documentation](#code-documentation)
3. [Generating Documentation](#generating-documentation)
4. [Documentation Standards](#documentation-standards)

## API Documentation

We use Swagger/OpenAPI for API documentation. The API documentation is automatically generated from JSDoc comments in the API route handlers.

### Accessing API Documentation

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser

### Documenting API Endpoints

Add JSDoc comments above your API route handlers. Example:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users
 *     description: Returns a list of all registered users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export default function handler(req, res) {
  // Handler implementation
}
```

## Code Documentation

We use JSDoc for code documentation. The documentation is generated from source code comments.

### Generating Code Documentation

1. Generate documentation:
   ```bash
   npm run docs
   ```
2. Serve the documentation locally:
   ```bash
   npm run docs:serve
   ```
3. Open [http://localhost:4000](http://localhost:4000) in your browser

### Documenting Components

Add JSDoc comments to your React components:

```typescript
/**
 * A button component with various styles and states
 * @component
 * @param {Object} props - Component props
 * @param {string} props.variant - The button variant (primary, secondary, danger)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} Rendered button component
 * @example
 * <Button variant="primary" onClick={() => console.log('Clicked!')}>
 *   Click me
 * </Button>
 */
const Button = ({ variant, disabled = false, onClick, children }) => {
  // Component implementation
};
```

## Documentation Standards

### General Guidelines

- All exported functions, components, and classes must have JSDoc comments
- Include parameter types and return types
- Document all props for React components
- Include examples for complex components
- Keep comments up-to-date with code changes

### JSDoc Tags

Use the following JSDoc tags:

- `@component` - For React components
- `@param` - For function parameters
- `@returns` - For return values
- `@example` - For usage examples
- `@deprecated` - For deprecated code
- `@see` - For related documentation
- `@todo` - For pending tasks

## Testing Documentation

Document your tests to explain the purpose of each test case:

```typescript
/**
 * Test suite for the authentication flow
 * @group auth
 */
describe('Authentication', () => {
  /**
   * Test successful user login
   * @test {loginUser}
   */
  it('should log in a user with valid credentials', async () => {
    // Test implementation
  });
});
```

## Maintaining Documentation

1. Update documentation when making code changes
2. Run the documentation generation to verify changes
3. Keep examples up-to-date with the latest API changes
4. Remove outdated or deprecated documentation
