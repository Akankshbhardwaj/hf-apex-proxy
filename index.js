const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Hugging Face API token
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

app.use(bodyParser.json());

app.post('/summarize', async (req, res) => {
    const inputText = req.body.inputs;

    if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'inputs' in request body." });
    }

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/google/flan-t5-small',
            { inputs: `Explain: ${inputText}` },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        // Hugging Face returns an array of objects with 'generated_text'
        if (Array.isArray(response.data) && response.data[0]?.generated_text) {
            res.json({ summary: response.data[0].generated_text });
        } else if (response.data.error) {
            res.status(502).json({ error: response.data.error });
        } else {
            res.json(response.data);
        }
    } catch (error) {
        // Handle specific axios errors for better debugging
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                error: error.response.data.error || error.response.data
            });
        }
        res.status(500).json({ error: error.message || error.toString() });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
