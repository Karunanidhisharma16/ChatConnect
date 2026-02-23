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

// Search User by exact username
exports.searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Username is required for search' });
    }

    // Do a case-insensitive search
    const user = await User.findOne({
      username: new RegExp(`^${username}$`, 'i'),
      _id: { $ne: req.userId } // Don't search for ourselves
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's contacts
exports.getContacts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).populate('contacts', '-password');
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Return only the contacts
    res.json(currentUser.contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a user to contacts
exports.addContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.userId;

    if (contactId === userId) {
      return res.status(400).json({ message: 'Cannot add yourself as a contact' });
    }

    const currentUser = await User.findById(userId);
    const contactUser = await User.findById(contactId);

    if (!contactUser) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    // Check if already in contacts
    if (currentUser.contacts.includes(contactId)) {
      return res.status(400).json({ message: 'User is already in your contacts' });
    }

    // Add to current user's contacts
    currentUser.contacts.push(contactId);
    await currentUser.save();

    res.json({ message: 'Contact added successfully', contact: contactUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (Restored)
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