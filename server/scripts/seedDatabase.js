import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Exam, User } from '../models/index.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/docucenter');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample exam data
const sampleExams = [
  {
    name: 'UPSC Civil Services Exam 2025',
    category: 'Civil Services',
    description: 'The Civil Services Examination is a nationwide competitive examination in India conducted by the Union Public Service Commission for recruitment to various Civil Services of the Government of India, including the Indian Administrative Service, Indian Foreign Service, and Indian Police Service.',
    registrationStartDate: new Date('2025-02-01'),
    registrationEndDate: new Date('2025-03-21'),
    examDate: new Date('2025-06-15'),
    resultDate: new Date('2025-10-10'),
    websiteUrl: 'https://upsc.gov.in/',
    eligibility: 'Candidates must hold a degree from a recognized university. Age: 21-32 years (with relaxations for certain categories).',
    applicationFee: 'General: ₹100; SC/ST/PwD/Women: No Fee',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'JEE Main 2025 (Session 1)',
    category: 'Engineering',
    description: 'Joint Entrance Examination – Main, is an Indian standardized computer-based test for admission to various technical undergraduate programs in engineering, architecture, and planning across colleges in India.',
    registrationStartDate: new Date('2024-11-01'),
    registrationEndDate: new Date('2025-01-15'),
    examDate: new Date('2025-02-10'),
    resultDate: new Date('2025-03-05'),
    websiteUrl: 'https://jeemain.nta.nic.in/',
    eligibility: 'Candidates must have passed class 12th or equivalent with Physics, Chemistry and Mathematics.',
    applicationFee: 'General: ₹1000; SC/ST/PwD: ₹500',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'NEET UG 2025',
    category: 'Medical',
    description: 'National Eligibility cum Entrance Test (UG) is an entrance examination in India for students who wish to study undergraduate medical courses and dental courses in government or private medical colleges and dental colleges in India.',
    registrationStartDate: new Date('2024-12-01'),
    registrationEndDate: new Date('2025-02-15'),
    examDate: new Date('2025-05-03'),
    resultDate: new Date('2025-06-10'),
    websiteUrl: 'https://neet.nta.nic.in/',
    eligibility: 'Candidates must have passed class 12th with Physics, Chemistry, Biology/Biotechnology.',
    applicationFee: 'General: ₹1700; SC/ST/PwD: ₹1000',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'SSC CGL 2025',
    category: 'Civil Services',
    description: 'Staff Selection Commission Combined Graduate Level Examination is conducted for recruitment to various Group B and Group C posts in Central Government Ministries and Departments.',
    registrationStartDate: new Date('2024-10-15'),
    registrationEndDate: new Date('2024-11-30'),
    examDate: new Date('2025-01-20'),
    resultDate: new Date('2025-04-15'),
    websiteUrl: 'https://ssc.nic.in/',
    eligibility: 'Bachelor\'s degree from a recognized university.',
    applicationFee: 'General: ₹100; SC/ST/PwD/Ex-servicemen: No Fee',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'IBPS PO 2025',
    category: 'Banking',
    description: 'Institute of Banking Personnel Selection Probationary Officer examination for recruitment of Probationary Officers in various public sector banks.',
    registrationStartDate: new Date('2024-08-01'),
    registrationEndDate: new Date('2024-09-15'),
    examDate: new Date('2024-11-30'),
    resultDate: new Date('2025-01-20'),
    websiteUrl: 'https://www.ibps.in/',
    eligibility: 'Bachelor\'s degree in any discipline from a recognized university.',
    applicationFee: 'General: ₹850; SC/ST/PwD: ₹175',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'RRB NTPC 2025',
    category: 'Railways',
    description: 'Railway Recruitment Board Non-Technical Popular Categories examination for recruitment to various non-technical posts in Indian Railways.',
    registrationStartDate: new Date('2024-09-01'),
    registrationEndDate: new Date('2024-10-31'),
    examDate: new Date('2025-01-15'),
    resultDate: new Date('2025-04-01'),
    websiteUrl: 'https://www.rrbcdg.gov.in/',
    eligibility: 'Class 12th or equivalent from a recognized board.',
    applicationFee: 'General: ₹500; SC/ST/PwD/Ex-servicemen/Women: ₹250',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'GATE 2025',
    category: 'Engineering',
    description: 'Graduate Aptitude Test in Engineering is an examination conducted for admission to post-graduate programs in engineering and technology.',
    registrationStartDate: new Date('2024-08-15'),
    registrationEndDate: new Date('2024-10-15'),
    examDate: new Date('2025-02-01'),
    resultDate: new Date('2025-03-15'),
    websiteUrl: 'https://gate.iitk.ac.in/',
    eligibility: 'Bachelor\'s degree in Engineering/Technology or Master\'s degree in relevant science subjects.',
    applicationFee: 'General: ₹1850; SC/ST/PwD: ₹925',
    isVerified: true,
    status: 'active'
  },
  {
    name: 'CAT 2024',
    category: 'Management',
    description: 'Common Admission Test is a computer-based test for admission to various management programs in Indian Institutes of Management and other top business schools.',
    registrationStartDate: new Date('2024-08-01'),
    registrationEndDate: new Date('2024-09-20'),
    examDate: new Date('2024-11-24'),
    resultDate: new Date('2025-01-05'),
    websiteUrl: 'https://iimcat.ac.in/',
    eligibility: 'Bachelor\'s degree with at least 50% marks (45% for SC/ST/PwD).',
    applicationFee: 'General: ₹2400; SC/ST/PwD: ₹1200',
    isVerified: true,
    status: 'active'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Exam.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      email: 'admin@docucenter.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      verified: true
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);

    // Create sample user
    console.log('Creating sample user...');
    const sampleUser = new User({
      email: 'user@docucenter.com',
      password: 'user123',
      name: 'Sample User',
      role: 'user',
      verified: true
    });
    await sampleUser.save();
    console.log('Sample user created:', sampleUser.email);

    // Insert sample exams
    console.log('Inserting sample exams...');
    const insertedExams = await Exam.insertMany(sampleExams);
    console.log(`${insertedExams.length} exams inserted successfully`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Admin: admin@docucenter.com / admin123');
    console.log('User: user@docucenter.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();