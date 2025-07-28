# 🎓 CampusHub

[![MIT License](https://img.shields.io/github/license/Sudarsanam-R/campushub?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

A modern, full-stack event management platform for educational institutions, built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Key Features

### 🔐 Authentication
- **Multi-provider OAuth** (Google, GitHub, Microsoft, etc.)
- **Secure Password Policies** with visual strength indicator
- **Email Verification** for new accounts
- **Session Management** with JWT

### 🎯 User Experience
- **Responsive Design** for all devices
- **Dark/Light Mode** with system preference detection
- **Accessibility First** (ARIA labels, keyboard navigation)
- **Loading States** for better perceived performance

### 📅 Event Management
- **Create & Manage Events** with rich text descriptions
- **Event Categories & Tags** for better organization
- **Registration System** with attendance tracking
- **iCal Integration** for calendar exports

### 🛠 Admin Dashboard
- **User Management** (CRUD operations)
- **Event Moderation** tools
- **Analytics Dashboard** for insights
- **Role-based Access Control**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (or SQLite for development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sudarsanam-R/campushub.git
   cd campushub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/campushub?schema=public"

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional, for email features)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

### Database Setup

1. **PostgreSQL** (Recommended for production):
   - Install PostgreSQL
   - Create a new database
   - Update `DATABASE_URL` in `.env.local`

2. **SQLite** (For development only):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run storybook` - Launch Storybook
- `npm run cypress:open` - Open Cypress test runner

---

### 4. Create `.env` and `.env.example`

Copy all secrets and configuration into a `.env` file in the project root:

```env
# .env
# (Django will use SQLite by default. If you want PostgreSQL, configure it in django_backend/settings.py)
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

- **Never commit your real `.env` file to Git!**
- Instead, commit a `.env.example` with placeholder values for onboarding new developers.

---

### 4. Run Locally

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment

Deployed on **Vercel**:  
➡️ [https://campushub.vercel.app](https://campushub.vercel.app)

Every push to the `main` branch will automatically trigger a deployment.

---

## 🏗️ Project Structure

```bash
campus-hub/
├── .github/                  # GitHub workflows and templates
├── .storybook/               # Storybook configuration
├── app/                      # Next.js 13+ app directory
│   ├── (auth)/               # Auth-related routes
│   ├── (dashboard)/          # Dashboard routes
│   ├── (marketing)/          # Public marketing pages
│   ├── api/                  # API routes
│   └── layout.tsx            # Root layout
├── components/               # All React components
│   ├── ui/                   # Base UI components (shadcn/ui)
│   ├── shared/               # Shared components across features
│   └── features/             # Feature-specific components
├── config/                   # App configuration
├── documentation/            # Project documentation
├── lib/                      # Core libraries and utilities
│   ├── api/                  # API clients
│   ├── auth/                 # Authentication logic
│   ├── hooks/                # Custom React hooks
│   ├── prisma/               # Database schema and client
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── scripts/                  # Build and utility scripts
├── styles/                   # Global styles and themes
├── tests/                    # All test files
│   ├── e2e/                  # End-to-end tests
│   ├── integration/          # Integration tests
│   ├── unit/                 # Unit tests
│   └── config/               # Test configuration
└── types/                    # Global TypeScript types
```

---

## 🧪 Testing

This project uses a comprehensive testing strategy to ensure code quality and reliability.

### Test Structure

```
tests/
├── unit/         # Unit tests for individual components and utilities
├── integration/  # Integration tests for API routes and data fetching
└── e2e/          # End-to-end tests for critical user flows
```

### Running Tests

1. **Unit Tests**
   ```bash
   # Run all unit tests
   npm test
   
   # Run tests in watch mode
   npm test -- --watch
   
   # Generate coverage report
   npm test -- --coverage
   ```

2. **End-to-End Tests**
   ```bash
   # Run Cypress in interactive mode
   npm run cypress:open
   
   # Run all Cypress tests in headless mode
   npm run cypress:run
   ```

3. **Testing in CI**
   ```yaml
   # Example GitHub Actions workflow
   - name: Run tests
     run: |
       npm ci
       npm run build
       npm test
       npm run cypress:run
   ```

### Writing Tests

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between components and API routes
- **E2E Tests**: Test complete user flows in a real browser

## 🚀 Deployment

### Prerequisites
- Vercel account (for frontend)
- PostgreSQL database (or compatible database service)
- SMTP service (for email features)

### Deployment Steps

1. **Set up environment variables** in your deployment platform:
   ```env
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=your_secure_secret
   NEXTAUTH_URL=your_production_url
   # Add other required variables
   ```

2. **Deploy to Vercel**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FSudarsanam-R%2Fcampushub)

   Or manually:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Set up CI/CD** (optional)
   - Push to `main` branch triggers automatic deployment
   - Configure branch protection rules
   - Set up preview deployments for pull requests

### Environment Variables

Make sure to set these environment variables in your production environment:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Yes | Database connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js |
| `NEXTAUTH_URL` | Yes | Your production URL |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |

## 📚 Documentation

### Project Structure

```
campus-hub/
├── .github/           # GitHub workflows and issue templates
├── .storybook/        # Storybook configuration
├── app/               # Next.js 13+ app directory
│   ├── (auth)/        # Authentication routes
│   ├── (dashboard)/   # Protected dashboard routes
│   ├── api/           # API routes
│   └── layout.tsx     # Root layout
├── components/        # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── shared/        # Shared components
│   └── features/      # Feature-specific components
├── lib/               # Core libraries
│   ├── api/           # API clients
│   ├── auth/          # Authentication logic
│   ├── prisma/        # Database client and models
│   └── utils/         # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
└── tests/             # Test files
```

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Styling**: Tailwind CSS with CSS Modules
- **Form Handling**: React Hook Form
- **State Management**: React Context, SWR
- **Code Quality**: ESLint, Prettier, TypeScript
- **Documentation**: Storybook, JSDoc

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork** the repository and create your branch from `main`
2. **Clone** the project to your local machine
3. **Install** dependencies with `npm install`
4. **Create a feature branch** for your changes
5. **Commit** your changes with a descriptive commit message
6. **Push** your changes to your fork
7. Open a **Pull Request** to the `main` branch

### Development Workflow

1. **Create an issue** to discuss your proposed changes
2. **Write tests** for new features or bug fixes
3. **Run tests** locally before pushing
4. **Update documentation** as needed
5. **Follow** the project's code style with Prettier and ESLint

### Code Style

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep components small and focused

---

## 🐛 Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/Sudarsanam-R/campushub/issues/new) and include:

1. A clear title and description
2. Steps to reproduce the issue
3. Expected vs. actual behavior
4. Screenshots if applicable
5. Browser/OS version if relevant

---

## 🔒 Security

### Security Policy

We take security seriously. If you discover any security issues, please report them responsibly:

1. **Do not** create a public GitHub issue
2. Email security@example.com with the details
3. We'll respond within 48 hours to acknowledge your report
4. We'll work on a fix and keep you updated on our progress

### Security Features

- **Password Hashing**: Uses [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **CSRF Protection**: Built-in CSRF protection for all forms
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: Prevents XSS and injection attacks
- **Secure Headers**: Adds security-related HTTP headers
- **Content Security Policy**: Restricts resource loading

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

### Permissions
- Commercial use
- Modification
- Distribution
- Private use

### Limitations
- Liability
- Warranty

### Conditions
- License and copyright notice

---

## 🙌 Credits & Thanks

### Core Team

- **[Sudarsanam R](https://github.com/Sudarsanam-R)** - Project Maintainer

### Built With

- [Next.js](https://nextjs.org/) - The React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type-Safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS Framework
- [Prisma](https://www.prisma.io/) - Next-Gen ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication

### Special Thanks

- All our contributors who have helped improve CampusHub
- The open source community for their amazing tools and libraries

---

## 🌟 Support

If you find this project useful, please consider giving it a ⭐️ on [GitHub](https://github.com/Sudarsanam-R/campushub).

### Ways to Support

- **Star** the repository
- **Report** bugs and issues
- **Suggest** new features
- **Contribute** code or documentation
- **Share** with others who might find it useful

---

## 📬 Contact

Have questions or want to get in touch?

- **Email**: sudarsanam@example.com
- **GitHub**: [@Sudarsanam-R](https://github.com/Sudarsanam-R)
- **Website**: [https://sudarsanam.me](https://sudarsanam.me)

---

## 📈 Project Status

**Active Development** - We're actively working on new features and improvements. Check out our [project board](https://github.com/users/Sudarsanam-R/projects/1) to see what we're working on next!

### Upcoming Features

- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Version
Current version: v1.0.0

---

## 🎉 Getting Help

If you need help with anything, please don't hesitate to open an issue. We're here to help!

