import mongoose from 'mongoose';

const ReportsSchema = new mongoose.Schema({
  standards: {
    type: Number,
    required: true,
  },
  subject:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true,
  },
  collageName: {
    type: String,
    required: true,
  },
  reportAnalysis: {
    type: String,
    required: true,
  },
},{timestamps:true});



export default mongoose.models.Reports || mongoose.model('Reports', ReportsSchema);
