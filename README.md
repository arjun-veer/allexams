# 🎓 DocuCenter - Complete Document & Exam Management Platform

<div align="center">

![DocuCenter Logo](client/public/og-image.png)

**A comprehensive platform for document management and competitive exam tracking**

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-blue?logo=tailwindcss)](https://tailwindcss.com/)

</div>

## 🌟 Overview

DocuCenter is a modern, full-stack web application designed to streamline document management and competitive exam tracking for students, professionals, and administrators. Built with cutting-edge technologies, it offers a seamless experience for organizing important documents and staying updated with exam schedules.

### 🎯 Key Features

#### 📄 **Advanced Document Management**
- **Smart Upload System**: Drag-and-drop interface with real-time validation
- **21 Document Categories**: Organized categorization including Academic Records, Certificates, ID Proofs, Financial Documents, and more
- **Secure File Storage**: Cloud-based storage with Cloudinary integration
- **Multi-format Support**: PDFs, images (JPG, PNG, WebP, GIF, BMP, TIFF, SVG), and more
- **Document Processing**: Built-in PDF processing tools for enhanced functionality
- **Advanced Viewer**: In-browser document viewing with zoom, rotation, and navigation controls
- **Smart Search & Filtering**: Find documents quickly with intelligent search and category filters

#### 🎓 **Comprehensive Exam Management**
- **Exam Tracking**: Track registration dates, exam dates, result dates, and deadlines
- **Smart Search**: AI-powered exam search using Perplexity API integration
- **Category Management**: Organize exams by type (Government, Engineering, Medical, etc.)
- **Real-time Updates**: Stay informed with automated notifications
- **Admin Dashboard**: Comprehensive exam management for administrators

#### 🔐 **Enterprise-Grade Security**
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Admin and user roles with specific permissions
- **Protected Routes**: Secure access to sensitive areas
- **Data Encryption**: Encrypted password storage and secure API endpoints

#### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: Customizable theme preferences
- **Accessible Design**: Built with accessibility standards (WCAG)
- **Smooth Animations**: Framer Motion powered transitions
- **Horizontal Scrollable Tabs**: Enhanced navigation for document categories

## 🏗️ Architecture & Technology Stack

### **Frontend Architecture**
```
📦 Modern React SPA
├── 🔧 Vite - Lightning-fast build tool
├── 📘 TypeScript - Type-safe development
├── 🎨 Tailwind CSS - Utility-first styling
├── 🧩 shadcn/ui - Beautiful, accessible components
├── 📊 Zustand - Lightweight state management
├── 🔄 React Query - Server state management
├── 🛣️ React Router - Client-side routing
└── 📱 Responsive Design - Mobile-first approach
```

### **Backend Architecture**
```
📦 RESTful API Server
├── 🚀 Express.js - Fast, minimalist framework
├── 🗄️ MongoDB - NoSQL database with Mongoose ODM
├── 🔐 JWT - JSON Web Token authentication
├── 📁 Multer - File upload handling
├── ☁️ Cloudinary - Cloud file storage
├── 🛡️ Security - Helmet, CORS, Rate limiting
└── ✅ Validation - Joi schema validation
```

### **Key Dependencies**

#### Frontend Technologies
- **React 18.3.1** - Modern React with concurrent features
- **TypeScript 5.5.3** - Static type checking
- **Vite 5.4.1** - Next-generation frontend tooling
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Low-level UI primitives for design systems
- **React Hook Form** - Performant forms with easy validation
- **Zustand** - Small, fast, and scalable state management
- **React Query** - Powerful data synchronization
- **Lucide React** - Beautiful & consistent icon toolkit
- **Recharts** - Composable charting library

#### Backend Technologies
- **Express.js 4.18.2** - Fast, unopinionated web framework
- **MongoDB with Mongoose 7.6.3** - Elegant MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication
- **Cloudinary 1.41.3** - Cloud-based image and video management
- **Bcrypt.js 2.4.3** - Password hashing library
- **Helmet 7.1.0** - Security middleware
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **Express Rate Limit** - Basic rate-limiting middleware
- **Joi 17.11.0** - Object schema validation

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/arjun-veer/allexams.git
   cd docucenter
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configurations
   
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Environment Variables**
   
   **Server (.env)**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/docucenter
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```

### 🌐 Accessing the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## 📱 Features Walkthrough

### 🏠 **Dashboard**
- **Document Overview**: Quick stats and recent uploads
- **Exam Tracker**: Upcoming exams and deadlines
- **Quick Actions**: Fast access to common tasks
- **Analytics**: Visual charts showing document statistics

### 📄 **Document Management**
- **Upload Interface**: Modern modal with drag-and-drop support
- **Category Organization**: 21 predefined categories for optimal organization
- **Document Viewer**: In-browser viewing with advanced controls
- **Search & Filter**: Intelligent search across document names and categories
- **Bulk Operations**: Select and manage multiple documents

### 🎓 **Exam Management**
- **Exam Database**: Comprehensive database of competitive exams
- **Smart Search**: AI-powered search for finding relevant exams
- **Subscription System**: Track and subscribe to exam updates
- **Calendar Integration**: Visual representation of exam schedules
- **Notification System**: Automated reminders for important dates

### ⚙️ **Settings & Configuration**
- **Profile Management**: Update personal information and preferences
- **Theme Customization**: Switch between light and dark modes
- **API Integration**: Configure third-party services (Admin only)
- **Notification Preferences**: Customize alert settings

## 🛡️ Security Features

### **Authentication & Authorization**
- **Secure Registration**: Email verification and strong password requirements
- **JWT Tokens**: Stateless authentication with refresh token rotation
- **Role-Based Access**: Granular permissions for users and administrators
- **Session Management**: Automatic logout on token expiration

### **Data Protection**
- **Encrypted Storage**: Passwords hashed with bcrypt
- **Secure File Upload**: File type validation and size limits
- **CORS Protection**: Controlled cross-origin resource sharing
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive server-side validation

## 🗂️ Project Structure

```
docucenter/
├── 📁 client/                    # Frontend React application
│   ├── 📁 public/                # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📁 admin/         # Admin-specific components
│   │   │   ├── 📁 auth/          # Authentication components
│   │   │   ├── 📁 dashboard/     # Dashboard components
│   │   │   ├── 📁 document/      # Document management components
│   │   │   ├── 📁 layout/        # Layout components
│   │   │   └── 📁 ui/            # shadcn/ui components
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 lib/               # Utility functions and configurations
│   │   ├── 📁 pages/             # Page components
│   │   └── 📁 integrations/      # External service integrations
│   ├── 📄 package.json           # Dependencies and scripts
│   ├── 📄 tailwind.config.ts     # Tailwind CSS configuration
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   └── 📄 vite.config.ts         # Vite configuration
├── 📁 server/                    # Backend Express.js application
│   ├── 📁 models/                # MongoDB models
│   ├── 📁 routes/                # API route handlers
│   ├── 📁 middleware/            # Express middleware
│   ├── 📁 config/                # Configuration files
│   ├── 📁 utils/                 # Utility functions
│   ├── 📄 index.js               # Server entry point
│   ├── 📄 package.json           # Dependencies and scripts
│   └── 📄 README.md              # Server documentation
└── 📄 README.md                  # This file
```

## 🎯 Use Cases & Target Audience

### **Students**
- **Academic Document Management**: Store transcripts, certificates, ID cards
- **Exam Preparation**: Track competitive exam schedules and deadlines
- **Portfolio Building**: Organize achievements and accomplishments
- **Application Management**: Keep admission and scholarship documents ready

### **Working Professionals**
- **Career Documents**: Manage resumes, certificates, and professional records
- **Certification Tracking**: Monitor professional certification renewals
- **Compliance Documents**: Store industry-specific compliance documents
- **Skills Development**: Track continuing education and training certificates

### **Educational Institutions**
- **Student Records**: Centralized document management for students
- **Exam Administration**: Manage institutional and external exam schedules
- **Compliance Tracking**: Maintain accreditation and regulatory documents
- **Faculty Management**: Store faculty credentials and certifications

### **HR Departments**
- **Employee Records**: Secure storage of employee documents
- **Compliance Documentation**: Track mandatory training and certifications
- **Recruitment**: Organize candidate documents and credentials
- **Audit Preparation**: Quick access to required documentation

## 🚀 Deployment Options

### **Development Environment**
```bash
# Frontend (Vite Dev Server)
npm run dev          # http://localhost:8080

# Backend (Express with Nodemon)
npm run dev          # http://localhost:5000
```

### **Production Deployment**

#### **Frontend (Netlify/Vercel)**
```bash
npm run build        # Builds optimized production bundle
npm run preview      # Preview production build locally
```

#### **Backend (Heroku/DigitalOcean/AWS)**
```bash
npm start           # Production server start
```

#### **Database Options**
- **MongoDB Atlas** (Recommended for production)
- **Local MongoDB** (Development)
- **Docker MongoDB** (Containerized deployment)

## 📊 Performance & Optimization

### **Frontend Optimizations**
- **Code Splitting**: Automatic route-based code splitting with React Router
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with modern formats
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching Strategies**: Efficient browser caching with Vite

### **Backend Optimizations**
- **Database Indexing**: Optimized MongoDB queries with proper indexing
- **Compression**: Gzip compression for API responses
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Connection Pooling**: Efficient database connection management
- **Error Handling**: Comprehensive error logging and monitoring

## 🧪 Testing & Quality Assurance

### **Code Quality**
- **ESLint**: Enforces consistent code style and catches errors
- **TypeScript**: Static type checking prevents runtime errors
- **Prettier**: Automatic code formatting
- **Git Hooks**: Pre-commit hooks ensure code quality

### **Security Testing**
- **Dependency Scanning**: Regular security vulnerability scans
- **Input Validation**: Comprehensive server-side validation
- **Authentication Testing**: Secure token handling verification
- **CORS Configuration**: Proper cross-origin request handling

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh JWT token
POST /api/auth/logout       # User logout
```

### **Document Management**
```http
GET    /api/documents       # Get user documents
POST   /api/documents       # Upload new document
GET    /api/documents/:id   # Get specific document
PUT    /api/documents/:id   # Update document
DELETE /api/documents/:id   # Delete document
GET    /api/documents/view/:id   # View document (authenticated)
GET    /api/documents/download/:id # Download document
```

### **Exam Management**
```http
GET    /api/exams           # Get all exams
POST   /api/exams           # Create new exam (Admin)
GET    /api/exams/:id       # Get specific exam
PUT    /api/exams/:id       # Update exam (Admin)
DELETE /api/exams/:id       # Delete exam (Admin)
POST   /api/exams/search    # Search exams with AI
```

### **User Management**
```http
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update user profile
GET    /api/users           # Get all users (Admin)
PUT    /api/users/:id/role  # Update user role (Admin)
```

## 🔮 Future Roadmap

### **Version 2.0 - Enhanced Features**
- [ ] **Mobile App**: React Native mobile application
- [ ] **Offline Support**: Progressive Web App capabilities
- [ ] **Collaboration**: Share documents with other users
- [ ] **Advanced Analytics**: Detailed usage statistics and insights
- [ ] **Integration APIs**: Connect with external educational platforms

### **Version 2.1 - AI & Automation**
- [ ] **AI Document Analysis**: Automatic document categorization
- [ ] **Smart Reminders**: Intelligent deadline notifications
- [ ] **OCR Integration**: Extract text from scanned documents
- [ ] **Document Templates**: Pre-designed document templates

### **Version 2.2 - Enterprise Features**
- [ ] **Multi-tenant Architecture**: Support for multiple organizations
- [ ] **Advanced Permissions**: Granular access control
- [ ] **Audit Trails**: Comprehensive activity logging
- [ ] **SSO Integration**: Single Sign-On with SAML/OAuth
- [ ] **Backup & Recovery**: Automated backup solutions

## 📞 Support & Contact

### **Technical Support**
- **Documentation**: Comprehensive guides and API references
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Community**: Join our Discord community for discussions

### **Development Team**
- **Lead Developer**: [Arjun Veer](https://github.com/arjun-veer)
- **Project Repository**: [GitHub - allexams](https://github.com/arjun-veer/allexams)

### **Feedback & Suggestions**
We value your feedback! Please feel free to:
- Open an issue on GitHub
- Submit feature requests
- Contribute to discussions
- Share your use cases and success stories

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the education community**

[⭐ Star this repo](https://github.com/arjun-veer/allexams) • [🐛 Report Bug](https://github.com/arjun-veer/allexams/issues) • [✨ Request Feature](https://github.com/arjun-veer/allexams/issues)

</div>
