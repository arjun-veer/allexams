import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  documentName: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
    maxlength: [255, 'Document name cannot exceed 255 characters']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB in bytes
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  category: {
    type: String,
    enum: [
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
    ],
    default: 'Other Documents'
  },
  storagePath: {
    type: String, // Path in cloud storage or local storage
    required: true
  },
  cloudinaryPublicId: {
    type: String // For Cloudinary integration
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingResult: {
    type: mongoose.Schema.Types.Mixed // Store OCR or processing results
  }
}, {
  timestamps: true
});

// Indexes for better performance
documentSchema.index({ userId: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ fileType: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for file size in readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Ensure virtuals are included in JSON output
documentSchema.set('toJSON', { virtuals: true });

const Document = mongoose.model('Document', documentSchema);

export default Document;