# Django Backend for CampusHub

This directory contains the Django backend for the CampusHub project.

## Getting Started

1. Make sure you have Python 3.9+ installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the server:
   ```bash
   python manage.py runserver
   ```

By default, this uses SQLite. You can configure PostgreSQL or another DB in `django_backend/settings.py`.

## API Endpoints
- `/api/register/` - Register a new user
- `/api/login/` - Login
- `/api/events/` - Event CRUD

Integrate your React/Next.js frontend by pointing API calls to the Django server (e.g., `http://localhost:8000/api/`).
