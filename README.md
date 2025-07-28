# 🎓 CampusHub

![MIT License](https://img.shields.io/github/license/Sudarsanam-R/campushub)
![Vercel](https://vercelbadge.vercel.app/api/user/project) <!-- use your real URL -->
![Next.js](https://img.shields.io/badge/Next.js-15.3.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Stars](https://img.shields.io/github/stars/Sudarsanam-R/campushub?style=social)

> A modern, elegant web app to discover and register for college events and hackathons.

---

## 🌟 Features

- 🔐 OAuth login with Google, GitHub, Facebook, Apple, Microsoft
- 🔒 Secure password validation (min 8 chars, uppercase, lowercase, digit, special char)
- 🌟 Visual password strength caret (fills up to 8 chars, stays full after)
- 👤 Split first/last name fields in signup
- 📅 Event cards + registration form
- 🌓 Light/dark theme toggle
- ⚙️ Built with Next.js, Tailwind, TypeScript, NextAuth

---

## 🆕 Recent Updates

- **Password Validation:** Minimum length 8, no maximum. Must include uppercase, lowercase, digit, and special character.
- **Password Caret:** Custom caret visually fills up to 8 characters, remains full for longer passwords.
- **No Character Count:** Password fields do not show the number of characters typed.
- **Split Name Fields:** Signup form now asks for first and last name separately.
- **Consistent Validation:** All password fields (signup, login, reset) use the same logic and visuals.

---

## 🚀 Getting Started

### 🧰 Requirements

Make sure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)** (v18 or later recommended)
- **[Git](https://git-scm.com/)**
- A code editor like **[Visual Studio Code](https://code.visualstudio.com/)** (optional, but recommended)

To check if you already have Node.js and Git:

```bash
node -v
git --version
```

### 1. Get the Project Code

#### 🧪 Option A: Clone via Git

```bash
git clone https://github.com/Sudarsanam-R/campushub.git
cd campushub
```

#### 📁 Option B: Download ZIP

1. Go to: [https://github.com/Sudarsanam-R/campushub](https://github.com/Sudarsanam-R/campushub)
2. Click **"Code" → "Download ZIP"**
3. Extract the ZIP and open the folder in your terminal:

```bash
cd path-to-extracted-folder
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Usage

#### Local Development

You need to run **both the Next.js frontend** and the **Django backend** for full functionality.

**A. Start the Django Backend**

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd django_backend
   ```
2. (Recommended) **Create and activate a Python virtual environment:**
   - Create:
     ```bash
     python -m venv venv
     ```
   - Activate:
     - On **Windows**:
       ```bash
       venv\Scripts\activate
       ```
     - On **macOS/Linux**:
       ```bash
       source venv/bin/activate
       ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the Django server (default: http://localhost:8000):
   ```bash
   python manage.py runserver
   ```

**B. Start the Next.js Frontend**

1. In a separate terminal, from the project root:
   ```bash
   npm install
   npm run dev
   ```
2. Visit [http://localhost:3000](http://localhost:3000) in your browser.

**C. API Integration**

- The frontend will make API requests to the Django backend at `http://localhost:8000/api/`
- Adjust API URLs in your code or `.env` if you change ports or deploy remotely.

#### Password Requirements
- Minimum 8 characters (no max)
- At least one uppercase letter, one lowercase letter, one digit, and one special character
- Password strength is visually indicated by a blue caret bar

#### Signup Flow
- Enter first and last name, email, password, and complete captcha
- Password and confirm password must match
- No password character count is shown

#### Reset Password
- Same validation and visual rules as signup

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

This project uses multiple testing strategies to ensure code quality:

### Unit Tests
```bash
npm test
```

### End-to-End Tests with Cypress
```bash
# Run Cypress in interactive mode
npx cypress open

# Run all Cypress tests in headless mode
npx cypress run
```

### Test Coverage
To generate a test coverage report:
```bash
npm run test:coverage
```

## 🤝 Contributing

Pull requests and feedback welcome!  
Just fork the repo and submit a PR. ✨

---

## 🔒 Security

- User passwords are **never stored in plain text**. All passwords are securely hashed using [bcrypt](https://github.com/kelektiv/node.bcrypt.js) before being saved to the database.
- All secrets and API keys should be managed via your `.env` file and are excluded from version control by default.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Author

Built with ❤️ by [@Sudarsanam-R](https://github.com/Sudarsanam-R)

