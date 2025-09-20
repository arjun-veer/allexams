# DocuCenter Server

Backend API server for DocuCenter built with Express.js and MongoDB.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 📚 Exam management (CRUD operations)
- 📄 Document upload and management
- 👥 User management and profiles
- 🛡️ Admin dashboard and controls
- 🔒 Role-based access control
- 📁 File upload with validation
- 🚀 RESTful API design
- 💾 MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy the `.env` file and update with your configurations:
   ```bash
   # Copy and edit environment variables
   # Update MongoDB URI, JWT secrets, etc.
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system or update the `MONGODB_URI` in `.env` to point to your MongoDB Atlas cluster.

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```
   This will create sample data including:
   - Admin user: `admin@docucenter.com` / `admin123`
   - Sample user: `user@docucenter.com` / `user123`
   - Sample exams

5. **Start the server**:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile

### Exams
- `GET /api/exams` - Get all exams (with optional filters)
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams/:id/subscribe` - Subscribe to exam
- `DELETE /api/exams/:id/subscribe` - Unsubscribe from exam
- `GET /api/exams/user/subscriptions` - Get user's subscribed exams
- `GET /api/exams/meta/categories` - Get exam categories

### Documents
- `GET /api/documents` - Get user's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document by ID
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/meta/categories` - Get document categories
- `GET /api/documents/category/:category` - Get documents by category

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Admin (Requires Admin Role)
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `POST /api/admin/exams` - Create exam
- `PATCH /api/admin/exams/:id` - Update exam
- `DELETE /api/admin/exams/:id` - Archive exam
- `GET /api/admin/exams/pending` - Get pending exams
- `POST /api/admin/exams/pending/:id/approve` - Approve pending exam
- `POST /api/admin/exams/pending/:id/reject` - Reject pending exam

## File Upload

Documents are uploaded to the `/uploads` directory with the following structure:
```
uploads/
├── {userId}/
│   ├── document1.pdf
│   ├── document2.jpg
│   └── ...
```

Supported file types:
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)
- Word documents (.docx)

Maximum file size: 10MB

## Security Features

- Password hashing with bcrypt
- JWT tokens with configurable expiration
- Rate limiting to prevent abuse
- Helmet for security headers
- CORS configuration
- Input validation with Joi
- Role-based access control

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docucenter
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

### Users
- Email, password (hashed)
- Name, role (user/admin)
- Verification status
- Timestamps and last login

### Exams
- Name, category, description
- Registration and exam dates
- Website URL, eligibility, fees
- Verification and status flags

### Documents
- User reference, file metadata
- Category, storage path
- Upload timestamp

### Subscriptions
- User and exam references
- Notification preferences
- Active status

## Development

```bash
# Install dependencies
npm install

# Start development server with nodemon
npm run dev

# Run database seeding
npm run seed

# Start production server
npm start
```

## Health Check

The server provides a health check endpoint at `/health` that returns server status and basic information.

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.