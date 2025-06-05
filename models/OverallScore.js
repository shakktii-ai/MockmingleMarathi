import mongoose from 'mongoose';

const OverallScoreSchema = new mongoose.Schema({
  standards: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
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
