import express from 'express'
import dotenv from 'dotenv'

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//Serwer
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;