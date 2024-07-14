import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.post('/api/message', upload.single('image'), async (req, res) => {
    const { message } = req.body;
    const imagePath = req.file ? req.file.path : null;

    try {
        console.log('Using API Key:', process.env.OPENAI_API_KEY);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('API Error Response:', JSON.stringify(errorBody, null, 2));
            
            if (response.status === 429) {
                return res.status(429).json({ error: "API 사용량 초과. 잠시 후 다시 시도해주세요." });
            } else {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.error.message}`);
            }
        }

        const data = await response.json();
        console.log('API 응답:', JSON.stringify(data, null, 2));

        let gptResponse = '응답을 받지 못했습니다.';
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
            gptResponse = data.choices[0].message.content.trim();
        } else {
            console.error('예상치 못한 API 응답 구조:', data);
        }

        res.json({ response: gptResponse, imagePath });
    } catch (error) {
        console.error('ChatGPT API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('환경 변수 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
});