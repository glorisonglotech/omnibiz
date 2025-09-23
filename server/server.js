const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const teamRouter = require('./routes/teamRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const expenseRouter = require('./routes/expenseRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/appointments', appointmentRouter);

const port = process.env.PORT || 5000;

app.listen(port,()=>{
    connectDB();
    console.log(`server is running on port http://localhost:${port}`)
})