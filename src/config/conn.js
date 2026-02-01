import mongoose from 'mongoose';

const conn = async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DATABASE CONNECTED SUCCESSFULLY!");
  }catch(err){
    console.log("DATABASE CONNECTION FAILED!",err);
  }
}


export default conn;