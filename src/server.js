import express from 'express'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { setupRoutes } from './routes/endpoints.js'
import { setupAuthRoutes } from './routes/authRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/middleware.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(express.json());

setupRoutes(app);
setupAuthRoutes(app);

// Middleware dla błędów
app.use(errorHandler);
app.use(notFoundHandler);

// Obsługa niezłapanych wyjątków
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Obsługa niezłapanych odrzuceń promise'ów
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

//Serwer
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
export { server };