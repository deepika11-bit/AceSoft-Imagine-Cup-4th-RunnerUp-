const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
    res.send("✅ Server is running and ready to handle requests!");
});

// Function to detect the language of the user's message
async function detectLanguage(text) {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2/detect?key=${TRANSLATE_API_KEY}`,
            { q: text }
        );
        return response.data.data.detections[0][0].language; // Returns detected language code
    } catch (error) {
        console.error("Error detecting language:", error.response?.data || error.message);
        return "en"; // Default to English if detection fails
    }
}

// Function to translate text to a target language
async function translateText(text, targetLang) {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`,
            {
                q: text,
                target: targetLang,
                format: "text"
            }
        );
        return response.data.data.translations[0].translatedText; // Returns translated text
    } catch (error) {
        console.error("Error translating text:", error.response?.data || error.message);
        return text; // Return original text if translation fails
    }
}

// Chatbot endpoint
app.post("/generate", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Step 1: Detect user's language
        const userLang = await detectLanguage(userMessage);
        console.log("Detected Language:", userLang);

        // Step 2: Translate user's message to English
        const translatedMessage = await translateText(userMessage, "en");

        // Step 3: Send translated message to Gemini AI
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: translatedMessage }] }]
            }
        );

        const botReplyEnglish = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

        // Step 4: Translate Gemini AI's response back to user's original language
        const botReplyTranslated = await translateText(botReplyEnglish, userLang);

        res.json({ reply: botReplyTranslated });
    } catch (error) {
        console.error("Error in API call:", error.response?.data || error.message);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});