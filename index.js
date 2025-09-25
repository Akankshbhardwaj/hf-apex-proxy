const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Hugging Face API token
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

app.use(bodyParser.json());

app.post('/summarize', async (req, res) => {
    try {
        const inputText = req.body.inputs;
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
            { inputs: inputText },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`, // backticks
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
