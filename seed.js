const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = 'surakshahelpsite@gmail.com'; // Or your admin email
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists.');
      mongoose.connection.close();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    const adminUser = new User({
      name: 'Suraksha Admin', // ✅ ADD THIS NAME FIELD
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();