const mongoose = require('mongoose');

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connection to databse is established');
    } catch (error) {
        console.error(error);
    }
}
module.exports = connectDB;