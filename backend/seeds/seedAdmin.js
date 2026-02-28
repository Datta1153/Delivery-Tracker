import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@deliverytracker.com' });
    
    if (adminExists) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@deliverytracker.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Create default admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@deliverytracker.com',
      password: 'Admin@123',
      phone: '+1234567890',
      role: 'admin',
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@deliverytracker.com');
    console.log('🔑 Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
