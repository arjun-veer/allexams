import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Document } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Configure Cloudinary with explicit environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary config in documents route:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'docucenter/documents', // Use a general folder, we'll organize later
    resource_type: 'auto',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'docx'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${timestamp}-${randomSuffix}`;
    }
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get user's documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    if (category && category !== 'all') {
      query.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get documents with pagination
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// Simple test upload route
router.post('/test-upload', authenticateToken, (req, res) => {
  console.log('Test upload route reached');
  console.log('User:', req.user ? req.user._id : 'No user');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: 'Test route working',
    user: req.user ? req.user._id : 'No user'
  });
});

// Upload document with multer error handling
router.post('/upload', authenticateToken, (req, res, next) => {
  console.log('Upload route starting...');
  console.log('User authenticated:', req.user ? req.user._id : 'No user');
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field. Please upload a file with field name "file".'
          });
        }
      }
      return res.status(500).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('File:', req.file ? req.file.originalname : 'No file');
    console.log('Body:', req.body);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { category = 'Other Documents', documentName } = req.body;

    if (!documentName || !documentName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required'
      });
    }

    // Create document record with Cloudinary URL
    const document = new Document({
      userId: req.user._id,
      documentName: documentName.trim(),
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      url: req.file.path, // Cloudinary URL
      storagePath: req.file.path, // Same as URL for Cloudinary
      category,
      cloudinaryPublicId: req.file.filename // Store public ID for deletion
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file from Cloudinary if database save failed
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
});

// Update document
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { category, fileName } = req.body;
    
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update allowed fields
    if (category !== undefined) document.category = category;
    if (fileName !== undefined) document.fileName = fileName;

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from Cloudinary
    if (document.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete document record
    await Document.findByIdAndDelete(document._id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// Get document categories
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      'Certificates',
      'Identity Documents', 
      'Academic Records',
      'Exam Documents',
      'Admit Cards',
      'Result Documents',
      'Marksheets',
      'Transcripts',
      'Character Certificates',
      'Migration Certificates',
      'Provisional Certificates',
      'Degree Certificates',
      'Professional Documents',
      'Medical Certificates',
      'Income Certificates',
      'Residence Proof',
      'Employment Documents',
      'Legal Documents',
      'Financial Documents',
      'Insurance Documents',
      'Other Documents'
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get documents by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    
    const documents = await Document.find({
      userId: req.user._id,
      category
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    console.error('Get documents by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// View/Stream document
router.get('/view/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // For Cloudinary URLs, redirect to the direct URL for viewing
    res.redirect(document.url);
  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view document'
    });
  }
});

// Download document
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Type', document.fileType);

    // For Cloudinary URLs, redirect to the direct URL for download
    res.redirect(document.url);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

export default router;