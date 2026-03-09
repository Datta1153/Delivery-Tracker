const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@logistiq.com' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@logistiq.com',
                password: 'password123',
                role: 'ADMIN'
            });
            console.log('Admin user created');
        }

        // Check if staff exists
        const staffExists = await User.findOne({ email: 'staff@logistiq.com' });
        if (!staffExists) {
            await User.create({
                name: 'John Delivery',
                email: 'staff@logistiq.com',
                password: 'password123',
                role: 'STAFF'
            });
            console.log('Staff user created');
        }

        console.log('Seed completed');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
