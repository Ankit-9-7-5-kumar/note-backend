const express = require('express');
const  app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Note = require('./models/Note');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/authMiddleware');
const path = require('path');


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅mongodb connected'))
  .catch((err => console.log('❌mongodb connection error', err)));
// Add these routes before your notes routes



// User Registration
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});


// User Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});



app.get('/notes', auth, async (req, res) => {
    try {
      const notes = await Note.find({ user: req.user.userId }).sort({ createdAt: -1 });
      res.json(notes);
    } catch (err) {
      console.error("❌ Error fetching notes:", err.message);
      res.status(500).json({ error: "Server error" });
    }
});
  
app.post('/notes', auth, async (req, res) => {
    try {
      const { title, content } = req.body;
  
      const newNote = new Note({
        title,
        content,
        user: req.user.userId  // user ID from token
      });
  
      await newNote.save();
      res.status(201).json({ message: "Note created successfully", note: newNote });
    } catch (err) {
      console.error("❌ Error creating note:", err.message);
      res.status(500).json({ error: "Server error" });
    }
});

// 🧨 DELETE note
app.delete('/notes/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ PUT (update) note
app.put('/notes/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note updated successfully", note: updatedNote });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const port =3000;
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
  });