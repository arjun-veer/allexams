import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
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
  isVerified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better performance
examSchema.index({ category: 1 });
examSchema.index({ registrationEndDate: 1 });
examSchema.index({ examDate: 1 });
examSchema.index({ isVerified: 1 });
examSchema.index({ status: 1 });

// Virtual for checking if registration is open
examSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return now >= this.registrationStartDate && now <= this.registrationEndDate;
});

// Virtual for checking if exam is upcoming
examSchema.virtual('isUpcoming').get(function() {
  if (!this.examDate) return false;
  return new Date() < this.examDate;
});

// Ensure virtuals are included in JSON output
examSchema.set('toJSON', { virtuals: true });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;