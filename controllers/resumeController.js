const Resume = require('../models/Resume');
const Template = require('../models/Template');
const Theme = require('../models/Theme');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');


const generatePDF = async (resumeHTML) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(resumeHTML, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, '../uploads/', `${Date.now()}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4' });

  await browser.close();
  return pdfPath;
};


exports.generateResume = async (req, res) => {
  const { templateId, themeId, userData, customColors } = req.body;

  try {
    const template = await Template.findById(templateId);
    const theme = await Theme.findById(themeId);

    if (!template || !theme) {
      return res.status(404).json({ error: 'Template or Theme not found' });
    }

    let finalCss = theme.cssContent;

    if (customColors) {
      const { primaryColor, secondaryColor, fontFamily } = customColors;
      if (primaryColor) finalCss = finalCss.replace(/#007bff/g, primaryColor);
      if (secondaryColor) finalCss = finalCss.replace(/#333/g, secondaryColor);
      if (fontFamily) finalCss = finalCss.replace(/Arial, sans-serif/g, fontFamily);
    }

    const compiledTemplate = handlebars.compile(template.htmlContent);
    const resumeHTML = compiledTemplate({ ...userData, theme: { ...theme, cssContent: finalCss } });

    const pdfPath = await generatePDF(resumeHTML);

    const resume = new Resume({ templateId, themeId, userData, pdfPath, userId: req.user._id });
    await resume.save();

    res.status(201).json({ message: 'Resume generated successfully', resume });
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  const { id } = req.params;
  try {
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

   
    if (fs.existsSync(resume.pdfPath)) {
      return res.download(resume.pdfPath);
    } else {
      return res.status(404).json({ error: 'PDF not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  const { id } = req.params;
  const { templateId, themeId, userData, customColors } = req.body;

  try {
    const template = await Template.findById(templateId);
    const theme = await Theme.findById(themeId);
    const resume = await Resume.findById(id);

    if (!template || !theme || !resume) {
      return res.status(404).json({ error: 'Template, Theme, or Resume not found' });
    }

    let finalCss = theme.cssContent;
    if (customColors) {
      const { primaryColor, secondaryColor, fontFamily } = customColors;
      if (primaryColor) finalCss = finalCss.replace(/#007bff/g, primaryColor);
      if (secondaryColor) finalCss = finalCss.replace(/#333/g, secondaryColor);
      if (fontFamily) finalCss = finalCss.replace(/Arial, sans-serif/g, fontFamily);
    }

    const compiledTemplate = handlebars.compile(template.htmlContent);
    const resumeHTML = compiledTemplate({ ...userData, theme: { ...theme, cssContent: finalCss } });

    const pdfPath = await generatePDF(resumeHTML);

    if (fs.existsSync(resume.pdfPath)) {
      fs.unlinkSync(resume.pdfPath); 
    }

    resume.templateId = templateId;
    resume.themeId = themeId;
    resume.userData = userData;
    resume.pdfPath = pdfPath;
    await resume.save();

    res.status(200).json({ message: 'Resume updated and regenerated successfully', resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteResume = async (req, res) => {
  const { id } = req.params;
  try {
    const resume = await Resume.findByIdAndDelete(id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (fs.existsSync(resume.pdfPath)) {
      fs.unlinkSync(resume.pdfPath); 
    }

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};