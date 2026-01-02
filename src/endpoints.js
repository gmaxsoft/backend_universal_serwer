import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticateToken } from './middleware.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, errorFormat: 'colorless' });

export function setupRoutes(app) {

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'API i Serwer działa!',
      version: '1.0.0',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login'
        },
        users: {
          getAll: 'GET /users',
          getById: 'GET /users/:id',
          create: 'POST /users',
          update: 'PUT /users/:id',
          delete: 'DELETE /users/:id'
        },
        routes: {
          getAll: 'GET /routes',
          getById: 'GET /routes/:id',
          create: 'POST /routes',
          update: 'PUT /routes/:id',
          delete: 'DELETE /routes/:id'
        }
      }
    });
  });

  // Auth endpoints
  // POST /auth/register - Register new user
  app.post('/auth/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });

      // Zwróć user bez hasła
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // POST /auth/login - Login user
  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // CRUD for Users
  // GET /users - Get all users
  app.get('/users', authenticateToken, async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /users/:id - Get user by ID
  app.get('/users/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /users - Create new user
  app.post('/users', authenticateToken, async (req, res) => {
    try {
      const { email, name } = req.body;
      const user = await prisma.user.create({
        data: { email, name },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /users/:id - Update user
  app.put('/users/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name } = req.body;
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { email, name },
      });
      res.json(user);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /users/:id - Delete user
  app.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // CRUD for MainRoutes
  // GET /routes - Get all routes
  app.get('/routes', authenticateToken, async (req, res) => {
    try {
      const routes = await prisma.mainRoutes.findMany();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /routes/:id - Get route by ID
  app.get('/routes/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const route = await prisma.mainRoutes.findUnique({
        where: { id: parseInt(id) },
      });
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /routes - Create new route
  app.post('/routes', authenticateToken, async (req, res) => {
    try {
      const { method, url, name, userId } = req.body;
      const route = await prisma.mainRoutes.create({
        data: { method, url, name, userId: userId ? parseInt(userId) : null },
      });
      res.status(201).json(route);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /routes/:id - Update route
  app.put('/routes/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { method, url, name, userId } = req.body;
      const route = await prisma.mainRoutes.update({
        where: { id: parseInt(id) },
        data: { method, url, name, userId: userId ? parseInt(userId) : null },
      });
      res.json(route);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /routes/:id - Delete route
  app.delete('/routes/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.mainRoutes.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });
}