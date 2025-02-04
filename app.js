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
        cb(new Error('허용되지 않는 파일 형식입니다. jpg 또는 png 파일만 업로드 가능합니다.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 } // 5MB 제한
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const basePrompt = `
당신은 영양학과 식품과학 분야의 전문가인 AI 영양사입니다. 사용자가 업로드한 식단 이미지를 분석하여 종합적이고 구조화된 식단 정보를 제공합니다. 다음 JSON 형식에 따라 분석 결과를 출력하세요:

{
    "총칼로리": 0,
    "영양소비율": {
        "탄수화물": 0,
        "단백질": 0,
        "지방": 0
    },
    "음식상세": [
        {
            "음식명": "",
            "예상양": 0,
            "칼로리": 0,
            "영양정보": {
                "칼로리": 0,
                "탄수화물": 0,
                "단백질": 0,
                "지방": 0
            },
            "주요영양소": ""
        }
    ],
    "영양분석": {
        "장점": [],
        "개선점": []
    },
    "권장사항": [],
    "식사시간": {
        "적합한시간": "",
        "조언": ""
    },
    "주의사항": ""
}

모든 분석은 업로드된 이미지만을 기반으로 하며, 정확한 개인별 권장량을 위해서는 사용자의 성별, 나이, 체중, 활동 수준 등의 추가 정보가 필요함을 명시하세요.

사용자의 질문이나 요청에 따라 위의 형식을 유연하게 조정하지 말고, 항상 이 JSON 구조를 유지하세요.
각 음식의 '예상양'은 그램(g) 단위로 제공하고, '영양정보'는 100g 당 영양소 함량을 나타냅니다.
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
    
        res.json({ response: gptResponse, imageUrl });
    } catch (error) {
        enhancedLogging('API 처리 중 오류 발생:', error);
        res.status(500).json({ error: '서버 내부 오류입니다. 나중에 다시 시도해주세요.' });
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

function sanitizeJsonString(jsonString) {
    jsonString = jsonString.trim();
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
    const openBraces = (jsonString.match(/{/g) || []).length;
    const closeBraces = (jsonString.match(/}/g) || []).length;
    jsonString += '}}'.repeat(openBraces - closeBraces);
    return jsonString;
}

function parsePartialJson(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn("완전한 JSON 파싱 실패, 부분 파싱 시도:", error.message);
        const partialObject = {};
        jsonString.replace(/("[^"]+"):([^,}\]]+)/g, (match, key, value) => {
            try {
                partialObject[JSON.parse(key)] = JSON.parse(value);
            } catch (e) {
                partialObject[JSON.parse(key)] = value.trim();
            }
        });
        return partialObject;
    }
}

function getFallbackResponse(error, rawResponse) {
    return {
        error: "응답 파싱 중 오류가 발생했습니다.",
        message: error.message,
        rawResponse: rawResponse
    };
}

function enhancedLogging(message, data) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

function isResponseComplete(response) {
    try {
        JSON.parse(response);
        return true;
    } catch (error) {
        return false;
    }
}

function findLastCompleteObject(incompleteJson) {
    let lastValidIndex = incompleteJson.lastIndexOf('}');
    if (lastValidIndex === -1) return '';
    let openBraces = 0;
    for (let i = 0; i <= lastValidIndex; i++) {
        if (incompleteJson[i] === '{') openBraces++;
        if (incompleteJson[i] === '}') openBraces--;
    }
    while (openBraces > 0 && lastValidIndex > 0) {
        lastValidIndex = incompleteJson.lastIndexOf('}', lastValidIndex - 1);
        openBraces--;
    }
    return incompleteJson.substring(0, lastValidIndex + 1);
}

function mergeAndParseResponses(responses) {
    let mergedResponse = responses.join('');
    mergedResponse = sanitizeJsonString(mergedResponse);
    let completeJson = findLastCompleteObject(mergedResponse);
    try {
        return JSON.parse(completeJson);
    } catch (error) {
        enhancedLogging("JSON 파싱 실패, 부분 파싱 시도", error);
        return parsePartialJson(completeJson);
    }
}

async function getGPTResponse(message, imageBase64) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    let messages = [
        { role: "system", content: basePrompt },
        { role: "user", content: message }
    ];
    if (imageBase64) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: "Analyze this image:" },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
        });
    }

    const payload = {
        model: imageBase64 ? "gpt-4o" : "gpt-4",
        messages: messages,
        max_tokens: 1000,
        response_format: { type: "json_object" }
    };

    try {
        let allResponses = [];
        let isComplete = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!isComplete && retryCount < maxRetries) {
            try {
                const response = await axios.post(apiUrl, payload, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // 60 seconds timeout
                });

                if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
                    const content = response.data.choices[0].message.content;
                    allResponses.push(content);

                    if (isResponseComplete(content)) {
                        isComplete = true;
                    } else {
                        payload.messages.push({ role: "assistant", content: content });
                        payload.messages.push({ role: "user", content: "Please continue the previous response." });
                    }
                } else {
                    throw new Error('Invalid response structure from OpenAI API');
                }
            } catch (error) {
                enhancedLogging(`Attempt ${retryCount + 1} failed:`, error.message);
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        if (!isComplete) {
            throw new Error('Failed to get a complete response after maximum retries');
        }

        const parsedContent = mergeAndParseResponses(allResponses);
        enhancedLogging('Parsed GPT Response:', parsedContent);
        return parsedContent;
    } catch (error) {
        enhancedLogging('Failed to get GPT response:', error.response ? error.response.data : error.message);
        return getFallbackResponse(error, allResponses.join(''));
    }
}

function moveImageFile(imagePath) {
    const publicPath = path.join(__dirname, 'public', 'uploads', path.basename(imagePath));
    fs.renameSync(imagePath, publicPath);
    return `/uploads/${path.basename(imagePath)}`;
}

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('환경 변수 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
});