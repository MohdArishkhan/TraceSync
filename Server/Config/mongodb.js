const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DBURL);
        // console.log(`Connected to DB mongoose ${conn}`);
    }catch(e){
        // console.log(`Failed to connect DB Database ${e}`);
    }
};

module.exports = connectDB;