const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

app.use(express.json());

// 🔍 Route to list all available Gemini models
app.get('/models', async (req, res) => {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error?.response?.data || error.message });
    }
});

// 📝 Route to generate content using Gemini AI (Faster Model)
app.post('/generate', async (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: "Message is required in request body" });
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            }
        );

        const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        res.json({ reply: botReply });

    } catch (error) {
        res.status(500).json({ error: error?.response?.data || error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
