import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Only jpg or png files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const basePrompt = `
당신은 영양학과 식품과학 분야의 전문가인 AI 영양사입니다. 사용자가 업로드한 식단 이미지를 분석하여 종합적이고 구조화된 식단 정보를 제공합니다. 다음 형식에 따라 분석 결과를 출력하세요:

🍽️ 식단 요약
- 총 칼로리: [예상 총 칼로리] kcal
- 주요 영양소 비율: 탄수화물 [%], 단백질 [%], 지방 [%]

📊 음식 상세 정보
| 음식명 | 예상 양 | 칼로리 | 주요 영양소 |
|--------|---------|--------|-------------|
| [음식1] | [양] | [칼로리] kcal | [주요 영양소] |
| [음식2] | [양] | [칼로리] kcal | [주요 영양소] |
(이하 계속)

💡 영양 분석
- 장점: [식단의 긍정적인 측면 나열]
- 개선점: [보완이 필요한 부분 나열]

🌟 맞춤 권장 사항
1. [주요 권장 사항 1]
2. [주요 권장 사항 2]
3. [주요 권장 사항 3]

⏰ 식사 시간 조언
- 이 식단은 [아침/점심/저녁/간식]으로 적합합니다.
- [시간대에 따른 추가 조언]

📌 주의사항
[알레르기, 특정 식이 제한 등 주의해야 할 사항]

모든 분석은 업로드된 이미지만을 기반으로 하며, 정확한 개인별 권장량을 위해서는 사용자의 성별, 나이, 체중, 활동 수준 등의 추가 정보가 필요함을 명시하세요.

사용자의 질문이나 요청에 따라 위의 형식을 유연하게 조정하지 말고, 직관적으로 전달하고, 항상 친절하고 전문적인 톤을 유지하세요.
`;

app.post('/api/message', upload.single('image'), async (req, res) => {
    const { message } = req.body;

    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }

    try {
        const imageBase64 = req.file ? await encodeImageToBase64(req.file.path) : null;
        const gptResponse = await getGPTResponse(message, imageBase64);

        const imageUrl = req.file ? moveImageFile(req.file.path) : null;

        console.log('GPT Response:', gptResponse); // Updated log message
        res.json({ response: gptResponse, imageUrl });
    } catch (error) {
        console.error('Error during API processing:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});

function encodeImageToBase64(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) reject(err);
            else resolve(data.toString('base64'));
        });
    });
}

async function getGPTResponse(message, imageBase64) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    let messages = [{ role: "user", content: message }];
    if (imageBase64) {
        messages.push({
            role: "user",
            content: { type: "image_url", image_url: `data:image/jpeg;base64,${imageBase64}` }
        });
    }

    const payload = {
        model: imageBase64 ? "gpt-4o" : "gpt-4",
        messages: messages,
        max_tokens: 500
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });

        if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
            return response.data.choices[0].message.content.trim();
        }

        throw new Error('Invalid response structure from OpenAI API');
    } catch (error) {
        console.error('Failed to get GPT response:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get response from OpenAI: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
}

function moveImageFile(imagePath) {
    const publicPath = path.join(__dirname, 'public', 'uploads', path.basename(imagePath));
    fs.renameSync(imagePath, publicPath);
    return `/uploads/${path.basename(imagePath)}`;
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('Environment variable OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'set' : 'not set');
});