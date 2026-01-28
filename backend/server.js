const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

connectDB();

const authRoutes = require('./routes/auth');

app.use('/api/auth',authRoutes);

app.get('/health',(req,res)=>{
    res.json({status: 'OK', message:'Server is running'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});