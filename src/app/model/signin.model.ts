import mongoose from 'mongoose';

const signinSchema = new mongoose.Schema({
  workEmail: { type: String, required: true },
  password: { type: String, required: true },
  checkActionCode:{type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now },
});

const Signin = mongoose.model('Signin', signinSchema);

export default Signin;