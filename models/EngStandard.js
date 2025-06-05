import mongoose from 'mongoose';

const StandardSchema = new mongoose.Schema({
  standards: {
    type: Number,
    required: true,
  },
  board:{
    type:String,
    required:true,
  },
  subject:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
}, { timestamps: true });

export default mongoose.models.Standard || mongoose.model('Standard', StandardSchema);
