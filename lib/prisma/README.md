# Prisma Backend

This is the backend for the CampusHub project, using Prisma and PostgreSQL.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and update the `DATABASE_URL` and `JWT_SECRET`.

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /register`: Register a new user
- `POST /login`: Login a user
- `GET /me`: Get the current user's profile
- `POST /forgot-password`: Request a password reset
- `POST /reset-password`: Reset a user's password
- `POST /activate-account`: Activate a user's account

## Development

- Use `npm run dev` to start the development server with nodemon.
- Use `npm start` to start the production server. 