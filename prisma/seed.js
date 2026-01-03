import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg'; 
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

// Sprawdzenie, czy URL istnieje
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user);

  // Create MainRoutes entries
  const routes = [
    { method: 'GET', url: '/', name: 'Root API Info' },
    { method: 'POST', url: '/auth/register', name: 'User Registration' },
    { method: 'POST', url: '/auth/login', name: 'User Login' },
    { method: 'GET', url: '/users', name: 'Get All Users' },
    { method: 'GET', url: '/users/:id', name: 'Get User by ID' },
    { method: 'POST', url: '/users', name: 'Create User' },
    { method: 'PUT', url: '/users/:id', name: 'Update User' },
    { method: 'DELETE', url: '/users/:id', name: 'Delete User' },
    { method: 'GET', url: '/routes', name: 'Get All Routes' },
    { method: 'GET', url: '/routes/:id', name: 'Get Route by ID' },
    { method: 'POST', url: '/routes', name: 'Create Route' },
    { method: 'PUT', url: '/routes/:id', name: 'Update Route' },
    { method: 'DELETE', url: '/routes/:id', name: 'Delete Route' },
  ];

  for (const route of routes) {
    const createdRoute = await prisma.mainRoutes.create({
      data: {
        method: route.method,
        url: route.url,
        name: route.name,
        userId: user.id,
      },
    });
    console.log('Created route:', createdRoute);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });