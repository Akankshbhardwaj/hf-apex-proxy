const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Hugging Face API token (set in Render environment variables)
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

// === Configurable model ===
// Change this to any free Hugging Face model URL
let MODEL_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
// Example alternatives:
// 'https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6'

app.use(bodyParser.json());

// Health check route
app.get('/health', (req, res) => res.send('OK'));

// Summarization / explanation route
app.post('/summarize', async (req, res) => {
    const inputText = req.body.inputs;

    if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'inputs' in request body." });
    }

    try {
        const response = await axios.post(
            MODEL_URL,
            { inputs: inputText },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                error: error.response.data.error || error.response.data
            });
        }
        res.status(500).json({ error: error.message || error.toString() });
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
