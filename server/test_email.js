require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

async function testEmailAndClean() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/delivery_tracker');
        const db = mongoose.connection.db;

        const result = await db.collection('users').deleteMany({
            email: {
                $in: [
                    'dattatreyvaddankeri@gmail.com',
                    'dattatreyavaddankeri@gmail.com',
                    'engineerdatta1153@gmail.com'
                ]
            }
        });
        console.log('Deleted stuck users:', result.deletedCount);

        console.log('Testing SMTP configuration...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verify connection configuration
        await transporter.verify();
        console.log('SMTP connection verified successfully!');

        // Try sending a test email
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: "engineerdatta1153@gmail.com",
            subject: "Test from Logistiq",
            text: "This is a test email to verify SMTP configuration.",
        });
        console.log('Test email sent: %s', info.messageId);

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

testEmailAndClean();
