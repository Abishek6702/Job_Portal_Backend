const Theme = require("../models/Theme");

exports.createTheme = async (req, res) => {
  const { name, cssContent } = req.body;

  if (!name || !cssContent) {
    return res
      .status(400)
      .json({ error: "Name and CSS content are required." });
  }

  try {
    const theme = new Theme({ name, cssContent });
    await theme.save();
    res.status(201).json({ message: "Theme created successfully", theme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThemes = async (req, res) => {
  const themes = await Theme.find();
  res.status(200).json(themes);
};

exports.getThemeById = async (req, res) => {
  const { id } = req.params;
  try {
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.status(200).json(theme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  const { id } = req.params;
  const { name, cssContent } = req.body;

  try {
    const theme = await Theme.findByIdAndUpdate(
      id,
      { name, cssContent },
      { new: true }
    );
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.status(200).json({ message: "Theme updated successfully", theme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTheme = async (req, res) => {
  const { id } = req.params;
  try {
    const theme = await Theme.findByIdAndDelete(id);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
