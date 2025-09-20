import mongoose from 'mongoose';

const pendingExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
    maxlength: [200, 'Exam name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Exam category is required'],
    enum: [
      'Engineering', 
      'Medical', 
      'Civil Services',
      'Banking',
      'Railways',
      'Defence',
      'Teaching',
      'State Services',
      'School Board',
      'Law',
      'Management',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Exam description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  registrationStartDate: {
    type: Date,
    required: [true, 'Registration start date is required']
  },
  registrationEndDate: {
    type: Date,
    required: [true, 'Registration end date is required']
  },
  examDate: {
    type: Date
  },
  resultDate: {
    type: Date
  },
  answerKeyDate: {
    type: Date
  },
  websiteUrl: {
    type: String,
    required: [true, 'Website URL is required'],
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  eligibility: {
    type: String,
    maxlength: [1000, 'Eligibility cannot exceed 1000 characters']
  },
  applicationFee: {
    type: String,
    maxlength: [500, 'Application fee cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
pendingExamSchema.index({ status: 1 });
pendingExamSchema.index({ category: 1 });
pendingExamSchema.index({ createdAt: -1 });

const PendingExam = mongoose.model('PendingExam', pendingExamSchema);

export default PendingExam;