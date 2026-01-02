import express from 'express'
import dotenv from 'dotenv'
import { PrismaClient } from './generated/prisma'
const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//Endpoint testowy
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

//Serwer
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;