const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Hugging Face API token stored as environment variable in Render
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

app.use(bodyParser.json());

// Health check route
app.get('/health', (req, res) => res.send('OK'));

// Summarization / explanation route
app.post('/summarize', async (req, res) => {
    const inputText = req.body.inputs;

    // Validate input
    if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'inputs' in request body." });
    }

    try {
        // Call Hugging Face Inference API
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/google/flan-t5-small', // Change model here if needed
            { inputs: `Explain: ${inputText}` },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        // Return the generated text
        if (Array.isArray(response.data) && response.data[0]?.generated_text) {
            res.json({ summary: response.data[0].generated_text });
        } else if (response.data.error) {
            res.status(502).json({ error: response.data.error });
        } else {
            res.json(response.data);
        }

    } catch (error) {
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                error: error.response.data.error || error.response.data
            });
        }
        res.status(500).json({ error: error.message || error.toString() });
    }
});

// Start server
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
