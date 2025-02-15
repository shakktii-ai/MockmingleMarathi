const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {type :String , required:true },
    email: {type :String , required:true, unique:true },
    DOB: {type :String , required:true },
    address: {type :String , required:true},
    mobileNo: {type :String , required:true, unique:true },
    education: {type :String , required:true },
    password: {type:String , required:true },
    profileImg: {type:String  },
    
    
    
  },{timestamps:true});


  export default mongoose.models.User ||mongoose.model("User",UserSchema);


// import bcrypt from 'bcryptjs';

// const UserSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     DOB: { type: String, required: true },
//     address: { type: String, required: true },
//     mobileNo: { type: String, required: true, unique: true },
//     education: { type: String, required: true },
//     password: { type: String, required: true },
//     profileImg: { type: String, required: true },
// }, { timestamps: true });

// // Before saving the user, hash the password
// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// export default mongoose.models.User || mongoose.model('User', UserSchema);
