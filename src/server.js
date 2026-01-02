import express from 'express'
import dotenv from 'dotenv'
import { setupRoutes } from './endpoints.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

setupRoutes(app);

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;