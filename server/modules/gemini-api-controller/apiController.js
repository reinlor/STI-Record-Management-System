const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

router.post('/interpret', async (req, res) => {
    const { question, stats } = req.body;

    if (!question || !stats) {
        return res.status(400).json({ error: "Missing 'question' or 'stats' in request body." });
    }

    const systemPrompt = "You are an experienced data analyst specializing in educational psychology and student wellness. Your task is to interpret survey data and provide a concise, actionable summary tailored for a high school guidance counselor. Focus on identifying key trends, anomalies, and areas requiring immediate attention. Based on the most common responses, provide specific recommendations to address prevalent student needs and improve wellness. The output must be professional and straightforward. Make it brief and summarized in 2-3 sentences";

    const userQuery = `Interpret these wellness survey results for the question: "${question}". Here are the response percentages: ${JSON.stringify(stats)}.`;

    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [{ 
            parts: [{ text: userQuery }] 
        }]
    };

    const MAX_RETRIES = 3;
    let interpretation = "AI interpretation unavailable.";
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const geminiRes = await axios.post(
                API_URL,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    params: { key: GEMINI_API_KEY }
                }
            );

            interpretation = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (interpretation) {
                return res.json({ interpretation });
            }
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }

    res.status(500).json({ interpretation });
});

module.exports = router;