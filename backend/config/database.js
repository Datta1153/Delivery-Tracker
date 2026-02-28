import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/package_tracking';
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn('⚠️  Server will continue without database. Some features may not work.');
    console.warn('📌 To fix: Create a free MongoDB Atlas cluster and update MONGODB_URI in .env');
    return null;
  }
};

export default connectDB;
