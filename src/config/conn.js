import mongoose from 'mongoose';

let isConnected = false; // Track if already connected

const conn = async () => {
  if (isConnected) return; // Reuse existing connection

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // optional, but recommended
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("DATABASE CONNECTED SUCCESSFULLY!");
  } catch (err) {
    console.log("DATABASE CONNECTION FAILED!", err);
  }
};

export default conn;
