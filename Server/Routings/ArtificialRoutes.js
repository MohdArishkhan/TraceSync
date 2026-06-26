const express = require('express');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    suggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    }
  },
  required: ["suggestions"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are an expert debugger. Return ONLY an array of brief, direct fixes for the code error. No explanations. Adapt array size to code complexity.",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.0,
  }
});

router.post('/api/ai/analyze', async (req, res) => {
  try {
    const { code, language, runState, runOutput } = req.body;

    const prompt = `L:${language}\nS:${runState}\nO:${runOutput}\nC:\n${code}`;

    const result = await model.generateContent(prompt);
    
    res.json(JSON.parse(result.response.text()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;