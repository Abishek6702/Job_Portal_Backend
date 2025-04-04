const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { apiUrl, apiKey } = require('../config/apiConfig');

exports.analyzeResume = async (req, res) => {
    try {
      const filePath = req.file.path;
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
  
      const response = await axios.post(apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
      });
  
      const resumeData = response.data.data;
      const { score, corrections } = calculateScoreAndCorrections(resumeData);
  
      res.status(200).json({
        message: 'Resume analyzed successfully',
        score,
        corrections,
        rawData: resumeData,
      });
    } catch (error) {
      res.status(500).json({ error: error.response?.data || error.message });
    }
  };
  

  const calculateScoreAndCorrections = (resumeData) => {
    let score = 100;
    let corrections = [];

    if (!resumeData.name?.first || !resumeData.emails?.length || !resumeData.phoneNumbers?.length) {
      corrections.push("Complete your personal details (Name, Email, Phone).");
      score -= 20;
    }
  
    if (!resumeData.education?.length) {
      corrections.push("Add your education details.");
      score -= 20;
    }

    const skillsSection = resumeData.sections?.find(section => section.sectionType === "Skills/Interests/Languages");
    if (!skillsSection || skillsSection.text.split(" ").length < 5) {
      corrections.push("Add more technical and soft skills.");
      score -= 20;
    }
 
    const experienceSection = resumeData.sections?.find(section => section.sectionType === "Experience");
  
    if (!experienceSection || !experienceSection.text || experienceSection.text.trim().length === 0) {
      corrections.push("Add your work experience with proper details.");
      score -= 20;
    } else {
      const experiences = experienceSection.text.split('\n').filter(line => line.trim() !== '');
      const hasValidExperience = experiences.some(line =>
        /\b(at|intern|developer|engineer|manager|lead|analyst)\b/i.test(line) &&
        /\b(\d{4})\b/.test(line) 
      );
  
      if (!hasValidExperience) {
        corrections.push("Provide detailed job titles, companies, and dates in your experience section.");
        score -= 10;
      }
    }
  
    if (!resumeData.certifications?.length) {
      corrections.push("Add relevant certifications.");
      score -= 10;
    }
    if (!resumeData.projects?.length) {
      corrections.push("Add personal or academic projects.");
      score -= 10;
    }
  
    return { score, corrections };
  };
  