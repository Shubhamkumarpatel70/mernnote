import express from 'express'
import User from '../Models/User.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken'
const router = express.Router();

router.post('/register',async(req,res)=>{
    const {username, email,password}=req.body;
      if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/.test(email)) {
    return res.status(400).json({ message: "Invalid Gmail address" });
  }
    try{
        if(!username||!email||!password){
            return res.status(400).json({message:'Please Fill All The Fields!'})
        }
       const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
})
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/.test(email)) {
    return res.status(400).json({ message: "Invalid Gmail address" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
export default router;