const User = require("../models/User");
const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Onboarding = require("../models/onboarding")

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

exports.registerEmployee = async (req, res) => {
  await registerUser(req, res, "employee");
};

exports.registerEmployer = async (req, res) => {
  await registerUser(req, res, "employer");
};

exports.registerAdmin = async (req, res) => {
  if (req.body.email !== process.env.ADMIN_EMAIL) {
    return res
      .status(403)
      .json({ message: "Unauthorized to create an admin account" });
  }
  await registerUser(req, res, "admin");
};

const registerUser = async (req, res, role) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, email, phone, password, role });
    await newUser.save();

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    await sendEmail(email, "Verify your Email", `Your OTP is: ${otp}`);
    res
      .status(201)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Expired OTP" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    await OTP.deleteOne({ email });

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "An error occurred, please try again." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not verified or does not exist" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        onboardingstatus: user.onboardingCompleted,
        email: user.email,
        name: user.name,
        firstTimeLogin: user.firstTimeLogin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendResetOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    await sendEmail(email, "Password Reset OTP", `Your OTP: ${otp}`);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    await sendEmail(email, "Verification OTP", `Your OTP: ${otp}`);
    res.json({ message: "Verification OTP resent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerInstructor = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      name,
      email,
      phone,
      password,
      role: "instructor",
    });
    await newUser.save();

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    await sendEmail(email, "Verify your Email", `Your OTP is: ${otp}`);
    res.status(201).json({
      message: "Instructor account created. OTP sent for verification.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginInstructor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: "instructor" });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "Instructor not verified or does not exist" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Instructor login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Populate savedJobs while fetching user
    const user = await User.findById(req.params.id)
      .populate('savedJobs'); // populate saved jobs

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch onboarding separately
    const onboarding = await Onboarding.findOne({ userId: user._id });

    // Combine both
    const response = {
      ...user.toObject(),
      onboarding: onboarding || null,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
