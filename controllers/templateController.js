const Template = require("../models/Template");

exports.createTemplate = async (req, res) => {
  const { name, htmlContent } = req.body;
  try {
    const template = new Template({ name, htmlContent });
    await template.save();
    res
      .status(201)
      .json({ message: "Template created successfully", template });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const extractFields = (htmlContent) => {
  const fieldRegex =
    /{{{\s*([\w.]+)\s*}}}|{{\s*(#each\s+(\w+)|(\/each)|([^{}]+))\s*}}/g;
  const fields = new Set();
  const contextStack = [];

  let match;
  while ((match = fieldRegex.exec(htmlContent)) !== null) {
    if (match[3]) {
      contextStack.push(match[3]);
      fields.add(match[3]);
    } else if (match[4]) {
      contextStack.pop();
    } else if (match[5]) {
      let field = match[5].trim();

      if (field.startsWith("this.")) {
        if (contextStack.length > 0) {
          field = field.replace("this.", `${contextStack.join(".")}.`);
        } else {
          field = field.replace("this.", "");
        }
      }

      if (contextStack.length > 0 && !field.includes(".")) {
        field = `${contextStack.join(".")}.${field}`;
      }

      field = field.replace(/\.+/g, ".").replace(/^\.|\.$/g, "");

      if (field) fields.add(field);
    }
  }

  return Array.from(fields);
};

exports.getTemplates = async (req, res) => {
  const templates = await Template.find();
  const templatesWithFields = templates.map((template) => ({
    ...template._doc,
    fields: extractFields(template.htmlContent),
  }));
  res.status(200).json(templatesWithFields);
};

exports.getTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const fields = extractFields(template.htmlContent);
    res.status(200).json({ template, fields });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, htmlContent } = req.body;
  try {
    const template = await Template.findByIdAndUpdate(
      id,
      { name, htmlContent },
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res
      .status(200)
      .json({ message: "Template updated successfully", template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await Template.findByIdAndDelete(id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
