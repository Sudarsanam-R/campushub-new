import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from './utils/mailer.js';

const app = express();
const router = express.Router();
const prisma = new PrismaClient();

app.use(express.json());

// Registration endpoint
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isFirstLogin: true,
      },
    });
    // Send welcome email
    await sendMail({
      to: email,
      subject: 'Welcome to CampusHub!',
      html: `<h1>Welcome, ${firstName || ''}!</h1><p>Thank you for registering at CampusHub.</p>`
    });
    return res.status(201).json({ message: 'User created successfully!', user: { id: user.id, email: user.email } });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // JWT secret should be stored in env
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ token, isFirstLogin: user.isFirstLogin });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Example protected route
router.get('/me', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token provided.' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Generate a token and send an email (implementation depends on your email service)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ message: 'Password reset email sent.', token });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json({ message: 'Email, token, and password are required.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    return res.json({ message: 'Password reset successful.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Activate account endpoint
router.post('/activate-account', async (req: Request, res: Response) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ message: 'Email and token are required.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
    return res.json({ message: 'Account activated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error activating account', error: error.message });
  }
});

// Mark first login complete and update profile
router.post('/mark-first-login-complete', async (req: Request, res: Response) => {
  const { email, dob, gender, phone, stream, degree, course, state, city, college, role } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { dob, gender, phone, stream, bio: course, profilePicture: college },
      create: { userId: user.id, dob, gender, phone, stream, bio: course, profilePicture: college },
    });
    // Mark first login as complete
    await prisma.user.update({ where: { id: user.id }, data: { isFirstLogin: false } });
    return res.json({ message: 'Profile updated and first login marked complete.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

app.use(router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Prisma backend running on port ${PORT}`);
});
