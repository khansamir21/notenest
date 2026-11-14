const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Uploaded files ko public access dene ke liye static folder set karna
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notenest')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('Database connection error: ', err));

// Razorpay Instance Initialize
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Basic Test Route
app.get('/', (req, res) => {
  res.send('NoteNest Backend is running...');
});

const Note = require('./models/Note');
const User = require('./models/User');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 1. Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add a new note
app.post('/api/notes', upload.single('file'), async (req, res) => {
  try {
    const { title, category, isPublic, description, uploader } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Please attach a document file!' });
    }

    if (uploader) {
      const user = await User.findOne({ name: uploader });
      if (user) {
        const userNotesCount = await Note.countDocuments({ uploader });
        const limit = user.uploadLimit || 5;

        if (userNotesCount >= limit) {
          return res.status(403).json({ 
            error: 'Free upload limit reached (Max 5 notes). Please upgrade your subscription to upload more!' 
          });
        }
      }
    }

    // ✨ Fixed: Dynamic URL for Render & Localhost both
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const fileExtension = path.extname(req.file.originalname).substring(1).toUpperCase();

    const newNote = new Note({
      title,
      category,
      fileUrl,
      fileType: fileExtension || 'PDF',
      isPublic: isPublic === 'true' || isPublic === true,
      description: description || '',
      uploader: uploader || 'Anonymous'
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Delete a note by ID
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully', deletedNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= USER AUTHENTICATION & SUBSCRIPTION ROUTES ================= //

// 4. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, gender, country, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered!' });
    }

    const newUser = new User({ 
      name, 
      email, 
      gender, 
      country, 
      password,
      isSubscribed: false,
      uploadLimit: 5
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password!' });
    }

    res.status(200).json({ 
      message: 'Login successful!', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        gender: user.gender,
        country: user.country,
        isSubscribed: user.isSubscribed,
        uploadLimit: user.uploadLimit 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= RAZORPAY PAYMENT ROUTES ================= //

// 6. Create Razorpay Order Route
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { planId } = req.body;
    let amount = 299 * 100;
    if (planId === 'pro50') amount = 599 * 100;
    if (planId === 'lifetime') amount = 999 * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_note_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's notes
app.get('/api/notes/mynotes', async (req, res) => {
  try {
    const { uploader } = req.query;
    const notes = await Note.find({ uploader }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Verify Razorpay Payment & Upgrade User Route
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, planId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      let extraLimit = 25;
      if (planId === 'pro50') extraLimit = 55;
      if (planId === 'lifetime') extraLimit = 999999;

      // ✨ Fixed: Corrected { new: true } instead of { new: time => true }
      const user = await User.findOneAndUpdate(
        { email }, 
        { isSubscribed: true, uploadLimit: extraLimit }, 
        { new: true }
      );

      if (!user) return res.status(404).json({ error: 'User not found' });

      return res.json({ 
        message: 'Payment verified & Subscribed successfully!', 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isSubscribed: user.isSubscribed,
          uploadLimit: user.uploadLimit
        } 
      });
    } else {
      return res.status(400).json({ error: 'Invalid signature, payment verification failed!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});