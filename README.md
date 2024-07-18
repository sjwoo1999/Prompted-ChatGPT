# 건생건사

<div style="text-align: center;">
    <img width="250" alt="건생건사(500x500)" src="https://github.com/user-attachments/assets/818ad24f-bb1a-4a07-981a-3f1a6eea44a8">
</div>

## 프로젝트 개요

건생건사는 사용자가 업로드한 식단 이미지를 AI가 분석하여 영양 정보를 제공하는 웹 애플리케이션입니다. 이 프로젝트의 주요 목적은 사용자들이 자신의 식단을 쉽게 분석하고 건강한 식습관을 형성할 수 있도록 돕는 것입니다.
* 건생건사는 멋쟁이사자처럼 대학 12기 고려대학교(세종) '건생건사' 팀의 프로젝트 진행을 위한 예제 프로젝트입니다. *

### 주요 기능
- 식단 이미지 업로드 및 분석
- 상세한 영양 정보 제공 (칼로리, 영양소 비율 등)
- 식단에 대한 AI 기반 피드백 및 개선 제안

### 대상 사용자
- 건강한 식습관을 형성하고자 하는 일반인
- 특정 영양 목표를 가진 운동선수나 다이어터
- 환자의 식단을 모니터링하는 영양사나 의료진

## 기술 스택

- 백엔드: Node.js (v14.x) - 서버 사이드 로직 처리
- 프론트엔드: HTML5, CSS3, JavaScript (ES6+) - 사용자 인터페이스 구축
- 데이터베이스: 현재 버전에서는 사용하지 않음 (향후 MongoDB 도입 예정)
- AI/ML: OpenAI GPT-4 API - 식단 이미지 분석
- 이미지 처리: Multer (v1.x) - 파일 업로드 관리
- 환경 변수 관리: dotenv (v10.x) - 환경 변수 설정 관리
- HTTP 클라이언트: Axios (v0.21.x) - HTTP 요청 처리

## 아키텍처

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|   Client       |     |   Server       |     |   OpenAI API   |
|   (Browser)    |<--->|   (Node.js)    |<--->|   (GPT-4)      |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
        ^                      ^
        |                      |
        v                      v
+----------------+     +----------------+
|                |     |                |
|   File System  |     |   Environment  |
|   (Images)     |     |   Variables    |
|                |     |                |
+----------------+     +----------------+
```

1. 클라이언트가 이미지와 메시지를 서버에 전송
2. 서버는 이미지를 파일 시스템에 저장하고 base64로 인코딩
3. 서버는 OpenAI API에 인코딩된 이미지와 메시지를 전송
4. OpenAI API가 분석 결과를 반환
5. 서버는 결과를 처리하여 클라이언트에 전송
6. 클라이언트는 결과를 사용자에게 표시

## ERD

현재 버전에서는 데이터베이스를 사용하지 않습니다. 향후 사용자 정보와 분석 이력을 저장하기 위해 다음과 같은 ERD를 구현할 예정입니다:

```
+---------------+       +---------------+
|    User       |       |   Analysis    |
+---------------+       +---------------+
| id            |       | id            |
| username      |       | user_id       |
| email         |       | image_url     |
| password_hash |       | result_json   |
| created_at    |       | created_at    |
+---------------+       +---------------+
        |                      ^
        |                      |
        +----------------------+
```

## 주요 기술

### OpenAI API 사용
- `axios`를 사용하여 OpenAI API에 HTTP 요청을 보냅니다.
- 이미지와 텍스트 프롬프트를 함께 전송하여 멀티모달 분석을 수행합니다.

```javascript
const response = await axios.post(apiUrl, payload, {
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
});
```

### 이미지 처리
- `multer` 미들웨어를 사용하여 이미지 업로드를 처리합니다.
- 업로드된 이미지는 서버의 파일 시스템에 저장되고, base64로 인코딩되어 API에 전송됩니다.

```javascript
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
```

### 실시간 통신
- 현재 버전에서는 HTTP 요청/응답 모델을 사용합니다.
- 향후 Socket.io를 도입하여 실시간 분석 결과 업데이트를 구현할 예정입니다.

## 설치 및 실행 방법

1. 레포지토리를 클론합니다:
   ```
   git clone https://github.com/yourusername/geonsenggeonsa.git
   cd geonsenggeonsa
   ```

2. 종속성을 설치합니다:
   ```
   npm install
   ```

3. `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. 애플리케이션을 실행합니다:
   ```
   npm start
   ```

5. 웹 브라우저에서 `http://localhost:3000`으로 접속합니다.

## 기여 방법

1. 이 레포지토리를 포크합니다.
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`).
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

이 README는 프로젝트의 현재 상태를 반영합니다. 프로젝트가 발전함에 따라 정기적으로 업데이트될 예정입니다.
