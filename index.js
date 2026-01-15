console.log(" THIS INDEX.JS IS RUNNING ");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const PORT = 5001;
const JWT_SECRET = "paywise_secret_key";
app.use(cors());

// middleware (AFTER app init)
app.use(express.json());

app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

// mongodb
mongoose
  .connect("mongodb+srv://vanshikavv23:UXeYG7LpOVzajqF8@cluster0.gbapvkt.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

// test route
app.get("/", (req, res) => {
  res.send("PayWise backend running 🚀");
});

// signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  res.json({ success: true, user: { id: user._id, name, email } });
});

// login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN ATTEMPT:", email);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});

// server start (MUST BE LAST)
app.listen(PORT, () => {
  console.log(`🚀 SERVER UP ON ${PORT}`);
});
