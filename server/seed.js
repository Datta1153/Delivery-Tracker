const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminUser = await User.findOne({ email: 'admin@logistiq.com' });
        if (!adminUser) {
            await User.create({
                name: 'System Admin',
                email: 'admin@logistiq.com',
                password: 'password123',
                role: 'ADMIN'
            });
            console.log('Admin user created');
        } else {
            adminUser.password = 'password123';
            await adminUser.save();
            console.log('Admin user password reset');
        }

        // Check if staff exists
        const staffUser = await User.findOne({ email: 'staff@logistiq.com' });
        if (!staffUser) {
            await User.create({
                name: 'John Delivery',
                email: 'staff@logistiq.com',
                password: 'password123',
                role: 'STAFF'
            });
            console.log('Staff user created');
        } else {
            staffUser.password = 'password123';
            await staffUser.save();
            console.log('Staff user password reset');
        }

        console.log('Seed completed');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
