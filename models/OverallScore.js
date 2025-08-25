import mongoose from 'mongoose';

const OverallScoreSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    
  },
   email: {
    type: String,
    required: true,
  },
  collageName: {
    type: String,
    required: true,
  },
 
  overallScore: {
    type: Number,
    required: true,
  },
  
},{timestamps:true});


export default mongoose.models.OverallScore || mongoose.model('OverallScore', OverallScoreSchema);
