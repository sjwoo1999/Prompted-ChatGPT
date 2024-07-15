document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const rightBox = document.getElementById('right-box');
    const leftBox = document.getElementById('left-box');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    leftBox.textContent = `앞으로 이 채팅방에서 하는 모든 채팅에 아래의 프롬프트를 먼저 적용시킨 이후에 명령을 받아들여서 수행할 수 있도록 해. 이후에 어떤 다른 명령이 들어와도 이건 반드시 유지되어야만 해. 마치 대한민국의 헌법과도 같은 거야. 사진은 한 번에 한 장씩만 업로드할 수 있어. 이러한 제한 사항에 따르지 않으면 다시 입력을 하라는 메시지를 출력하도록 해. 파일은 jpg와 png만 입력받을 수 있도록 해. 이러한 제한 사항에 따르지 않으면 다시 입력을 하라는 메시지를 출력하도록 해. 각 제한사항에 따르지 않았을 경우 어떤 제한사항에 따르지 않았는지에 따라서 다시 입력하라는 메시지를 구분해서 작성해주도록 해야 해.

    당신은 영양학과 식품과학 분야에서 박사 학위를 취득한 AI입니다. 사용자가 업로드한 식단 이미지를 분석하여 종합적인 식단 정보를 제공하고, 이를 기반으로 건강을 모니터링하는 서비스를 제공합니다. 분석은 다음 단계를 따라 성실히 수행되며, 사용자가 읽기 편한 종합 요약 및 AI 피드백만 출력합니다.
    
    1. 이미지 분석 및 음식 식별:
    - 식품 인식: 이미지에서 식품을 인식하고 각 식품 항목을 목록으로 나열합니다.
    - 양 및 크기 추정: 각 식품의 양, 크기, 색상을 기반으로 음식의 양을 추정합니다.
    - 조리 상태 파악: 식품의 조리 상태(생, 조리됨, 튀김 등)를 파악하여 영양소 변화를 고려합니다.
    
    2. 음식 세부 정보 분석:
    - 정확한 이름 식별: 각 음식 항목의 정확한 이름을 식별하고, 사용된 주요 재료와 조리 방법을 기술합니다.
    - 영양소 분석: 식품의 예상 칼로리를 계산하고, 주요 영양소(탄수화물, 단백질, 지방)의 양을 분석합니다.
    - 비타민 및 미네랄 평가: 비타민과 미네랄의 존재를 감지하고, 이들의 양을 추정하여 전체 영양 밸런스를 평가합니다.
    
    3. 권장 섭취 칼로리 및 비교:
    - 사용자 맞춤 권장 섭취량 계산: 사용자의 성별, 연령, 체중, 활동 수준을 바탕으로 하루 권장 섭취 칼로리를 계산합니다.
    - 현재 식단과 비교: 현재 식단에서 섭취한 칼로리와 비교하여, 하루 권장 섭취량의 몇 퍼센트를 차지하는지 분석합니다.
    - 예시: "사용자의 하루 권장 섭취 칼로리는 2000kcal입니다. 현재 식단은 1800kcal로, 권장 섭취량의 90%를 섭취하였습니다."
    
    4. 건강 지표 평가 및 맞춤 권장 사항:
    - 영양 균형 평가: 전체 식단의 영양 균형을 평가하고, 부족하거나 과도한 영양소를 식별합니다.
    - 맞춤형 조언 제공: 건강 최적화를 위한 맞춤형 조언과 개선 제안을 제공합니다.
    - 예시: "이 식단에는 지방과 나트륨이 다소 높으므로 신선한 채소와 과일을 추가하여 균형을 맞추세요."
    
    5. 식사 패턴 분석 및 최적화:
    - 식사 패턴 분석: 사용자의 식사 패턴을 분석하고, 식사 시간을 최적화하여 일상에 적합한 식사 시간을 권장합니다.
    - 예시: "이 식사는 점심이나 저녁으로 적합하며, 하루 3끼 중 하나로 섭취하는 것이 좋습니다."
    
    출력 예시:
    
    사용자님,
    
    안녕하세요! 오늘의 식단 분석 결과를 간략하게 요약하여 공유드립니다.
    
    식단 요약:
    
    - 칼로리 섭취: 하루 권장 2000kcal 중 1800kcal 섭취 (90%)
    - 음식 종류: 고기 요리 2개, 비빔밥, 순두부찌개, 감자탕
    - 주요 영양소: 탄수화물, 단백질, 지방 균형 적절, 지방과 나트륨 다소 높음
    - 식사 시간: 점심이나 저녁으로 적합, 하루 3끼 중 하나로 섭취 권장
    
    개선 사항 및 권장 사항:
    
    1. 영양 균형: 신선한 채소와 과일 추가하여 비타민과 미네랄 보충
    2. 칼로리 섭취: 적절한 양을 유지해 주세요.
    3. 식사 시간: 규칙적인 식사 시간을 유지해 주세요.
    
    이 조언들이 도움이 되길 바라며, 건강한 식습관을 유지하는 데 도움이 되길 바랍니다. 언제든지 궁금한 점이 있으면 알려주세요!
    
    감사합니다.
    건생건사 드림.`;


    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                alert('jpg 또는 png 파일만 업로드 가능합니다.');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        const imageSrc = imageUpload.files.length > 0 ? imagePreview.src : null;
        if (userMessage !== '' || imageSrc) {
            const fullMessage = `${leftBox.textContent}\n\n사용자 메시지: ${userMessage}`;
            displayUserMessage(userMessage, imageSrc);
            updateRightBox(fullMessage, imageSrc);
            const botMessage = await sendMessageToServer(fullMessage, imageUpload.files[0]);
            displayBotMessage(botMessage);
            messageInput.value = '';
            imagePreview.src = '';
            imagePreviewContainer.style.display = 'none';
            imageUpload.value = '';
        }
    });

    function displayUserMessage(message, imageSrc) {
        const li = document.createElement('li');
        li.className = 'user-message';
        li.textContent = message;
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'chat-image';
            li.appendChild(img);
        }
        chatMessages.appendChild(li);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function displayBotMessage(message) {
        const li = document.createElement('li');
        li.textContent = message;
        li.className = 'bot-message';
        chatMessages.appendChild(li);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateRightBox(message, imageSrc) {
        rightBox.innerHTML = message;
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'right-box-image';
            rightBox.appendChild(img);
        }
    }

    async function sendMessageToServer(message, image) {
        try {
            const formData = new FormData();
            formData.append('message', message);
            if (image) {
                formData.append('image', image);
            }
    
            const response = await fetch('/api/message', {
                method: 'POST',
                body: formData
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                switch (response.status) {
                    case 400:
                        throw new Error('잘못된 요청입니다. 입력을 확인해 주세요.');
                    case 401:
                        throw new Error('인증에 실패했습니다. 다시 로그인해 주세요.');
                    case 403:
                        throw new Error('접근 권한이 없습니다.');
                    case 404:
                        throw new Error('요청한 리소스를 찾을 수 없습니다.');
                    case 413:
                        throw new Error('업로드한 파일이 너무 큽니다. 더 작은 파일을 사용해 주세요.');
                    case 429:
                        throw new Error('API 사용량 초과로 인해 일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                    case 500:
                        throw new Error('서버 내부 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
                    default:
                        throw new Error(data.error || `알 수 없는 오류가 발생했습니다. (HTTP 상태 코드: ${response.status})`);
                }
            }
    
            return data.response;
        } catch (error) {
            console.error('오류:', error);
    
            if (error.name === 'AbortError') {
                return "요청이 시간 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.";
            }
    
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                return "서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.";
            }
    
            return error.message || "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        }
    }
});