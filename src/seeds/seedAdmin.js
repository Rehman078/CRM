import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User/userModel.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');

        // Admin credentials
        const adminData = {
            name: 'Admin',
            email: 'admin@crm.com',
            password: 'admin123',
            role: 'Admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Create admin user
        const admin = await User.create({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            role: adminData.role
        });

        console.log('Admin user created successfully!');
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        console.log('Role:', admin.role);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();
