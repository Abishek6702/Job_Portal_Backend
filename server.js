require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const resumeScoreRoutes = require("./routes/resumeScoreRoutes");
const interviewPrepration = require("./routes/interviewPreprationRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const videoRoutes = require("./routes/videoRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");



const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/themes", require("./routes/themeRoutes"));
app.use("/api/resumes", require("./routes/resumeRoutes"));
app.use("/api/resumes", resumeScoreRoutes);
app.use("/api/interviews", interviewPrepration);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
