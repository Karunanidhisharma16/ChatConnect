const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {

    try {
            console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        //find user by email
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'invalid  credentials'
            });
        }

        user.isOnline = true;
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isOnline: user.isOnline

            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


exports.logout = async (req,res)=>{
    try {
        const userId =req.userId

         const user = await User.findById(userId);
         if(!user){
            return res.status(404).json({message:'user not found'})
         }

          user.isOnline = false;
    user.lastSeen = Date.now();
    await user.save();

    res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}