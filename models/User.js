const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Recommended package for password hashing

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  weight: { type: Number, required: false },
  days: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }]
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Compare passwords using async/await
UserSchema.methods.comparePassword = async function(passw) {
  try {
    const isMatch = await bcrypt.compare(passw, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('User', UserSchema);
