const User = require('../models/User');

// Get all users (except current user)
exports.getAllUsers = async (req, res) => {
  try {
    // req.userId comes from auth middleware
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('-password')
      .sort({ username: 1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};