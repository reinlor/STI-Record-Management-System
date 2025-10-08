const axios = require("axios");

const getSummary = async (req, res) => {
    try {
        const { allData, slipData } = req.body;

        const prompt = `
You are a guidance personnel.

Summarize this student dashboard data into a short summary and a detailed report.

Return your response in strict JSON format like this:
{
  "shortSummary": "Two-sentence summary here.",
  "detailedSummary": "Two-paragraph detailed analysis here."
}

Violations:
${JSON.stringify(allData, null, 2)}

Requests:
${JSON.stringify(slipData, null, 2)}
    `;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "nousresearch/deephermes-3-llama-3-8b-preview:free",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2000,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Student Summary Report",
                    "Content-Type": "application/json",
                },
            }
        );

        const rawText = response.data.choices?.[0]?.message?.content?.trim();
        console.log("🔍 AI raw output:", rawText);

        let shortSummary = "";
        let detailedSummary = "";

        try {
            const parsed = JSON.parse(rawText);
            shortSummary = parsed.shortSummary || "";
            detailedSummary = parsed.detailedSummary || "";
        } catch (jsonErr) {
            console.warn("⚠️ JSON parse failed, using fallback:", jsonErr.message);
            shortSummary = rawText || "No summary generated.";
            detailedSummary = "";
        }

        res.json({ shortSummary, detailedSummary });
    } catch (error) {
        if (error.response) {
            console.error("OpenRouter error:", {
                status: error.response.status,
                data: error.response.data,
            });
        } else {
            console.error("Network/axios error:", error.message);
        }

        res.status(500).json({
            error: "Failed to generate summary",
            details: error.response?.data || error.message,
        });
    }
};

module.exports = { getSummary };
