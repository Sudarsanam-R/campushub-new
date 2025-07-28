# Contributing to CampusHub

Thank you for your interest in contributing to CampusHub! We're excited to have you on board. This document outlines the process for contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Code of Conduct

By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [your-email@example.com].

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
   ```bash
   git clone https://github.com/your-username/campushub.git
   cd campushub
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Set up environment variables (copy `.env.example` to `.env.local` and update values)
   ```bash
   cp .env.example .env.local
   ```
5. Start the development server
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

2. Make your changes and commit them with a descriptive message
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with login form"
   ```

3. Push your changes to your fork
   ```bash
   git push origin your-branch-name
   ```

4. Open a Pull Request against the `main` branch

## Code Style

- We use [Prettier](https://prettier.io/) for code formatting
- We use [ESLint](https://eslint.org/) for code linting
- Run the following commands before committing:
  ```bash
  npm run lint   # Check for linting errors
  npm run format # Format your code
  ```

## Testing

- Write tests for new features and bug fixes
- Run tests before submitting a PR
  ```bash
  npm test
  ```
- Ensure all tests pass before pushing your changes

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you

## Reporting Issues

When reporting issues, please include the following:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS version if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
