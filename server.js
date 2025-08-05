const express=require('express');
const app=express();
const routeV1=require('./routes/routeV1');
const cookieParser = require('cookie-parser');
const connectDB=require('./database/db');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(cookieParser());

const PORT=process.env.PORT || 3000;
app.use("/",routeV1);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error.message);
    process.exit(1);
  }
}

startServer();