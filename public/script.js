document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const rightBox = document.getElementById('right-box');
    const leftBox = document.getElementById('left-box');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const loadingAnimation = document.getElementById('loading-animation');

    leftBox.textContent = `당신은 영양학과 식품과학 분야에서 박사 학위를 취득한 AI입니다. 사용자가 업로드한 식단 이미지를 분석하여 종합적인 식단 정보를 제공하고, 이를 기반으로 건강을 모니터링하는 서비스를 제공합니다. 분석은 정해진 JSON 형식에 따라 수행되며, 사용자가 읽기 편한 종합 요약 및 AI 피드백을 제공합니다.`;

    imageUpload.addEventListener('change', handleImageUpload);

    chatForm.addEventListener('submit', handleFormSubmit);

    async function handleFormSubmit(e) {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        const imageSrc = imageUpload.files.length > 0 ? imagePreview.src : null;
        if (userMessage !== '' || imageSrc) {
            displayUserMessage(userMessage, imageSrc);
            updateRightBox(userMessage, imageSrc);
            showLoadingAnimation(true);

            try {
                const botMessageData = await sendMessageToServer(userMessage, imageUpload.files[0]);
                displayBotMessage(botMessageData);
            } catch (error) {
                displayBotMessage({ error: error.message });
            } finally {
                showLoadingAnimation(false);
            }

            resetForm();
        }
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                alert('jpg 또는 png 파일만 업로드 가능합니다.');
                clearImageUpload();
                return;
            }
            displayImagePreview(file);
        }
    }

    function displayUserMessage(message, imageSrc) {
        const li = createUserMessageElement(message, imageSrc);
        appendMessageToChat(li);
        appendLoadingAnimation();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createUserMessageElement(message, imageSrc) {
        const li = document.createElement('li');
        li.className = 'user-message';
        li.textContent = message;
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'chat-image';
            li.appendChild(img);
        }
        return li;
    }

    function appendMessageToChat(element) {
        chatMessages.appendChild(element);
    }

    function appendLoadingAnimation() {
        chatMessages.appendChild(loadingAnimation);
        showLoadingAnimation(true);
    }

    function showLoadingAnimation(visible) {
        loadingAnimation.style.visibility = visible ? 'visible' : 'hidden';
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
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data.response;
        } catch (error) {
            console.error('Error:', error);
            throw new Error("Sorry, an error occurred while processing your request.");
        }
    }

    function displayBotMessage(messageData) {
        const li = createBotMessageElement(messageData);
        appendMessageToChat(li);
        showLoadingAnimation(false);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createBotMessageElement(messageData) {
        const li = document.createElement('li');
        li.className = 'bot-message';
        if (messageData.error) {
            li.textContent = messageData.error;
        } else {
            li.innerHTML = formatBotMessage(messageData);
        }
        return li;
    }

    function formatBotMessage(data) {
        let html = `<h3>식단 분석 결과</h3>`;
        html += `<p><strong>총 칼로리:</strong> ${data.총칼로리} kcal</p>`;
        html += `<p><strong>영양소 비율:</strong> 탄수화물 ${data.영양소비율.탄수화물}%, 단백질 ${data.영양소비율.단백질}%, 지방 ${data.영양소비율.지방}%</p>`;
        html += `<h4>음식 상세 정보</h4>`;
        html += `<div class="food-items">`;
        data.음식상세.forEach(food => {
            html += `<div class="food-item">
                        <p><strong>${food.음식명}</strong>: ${food.예상양}g, ${food.칼로리} kcal</p>
                        <p>100g 당 영양정보:</p>
                        <ul>
                            <li>칼로리: ${food.영양정보.칼로리} kcal</li>
                            <li>탄수화물: ${food.영양정보.탄수화물}g</li>
                            <li>단백질: ${food.영양정보.단백질}g</li>
                            <li>지방: ${food.영양정보.지방}g</li>
                        </ul>
                        <p>주요 영양소: ${food.주요영양소}</p>
                     </div>`;
        });
        html += `</div>`;
        html += `<h4>영양 분석</h4>`;
        html += `<p><strong>장점:</strong> ${data.영양분석.장점.join(', ')}</p>`;
        html += `<p><strong>개선점:</strong> ${data.영양분석.개선점.join(', ')}</p>`;
        html += `<h4>권장 사항</h4>`;
        html += `<ul>`;
        data.권장사항.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul>`;
        html += `<p><strong>식사 시간:</strong> ${data.식사시간.적합한시간} - ${data.식사시간.조언}</p>`;
        html += `<p><strong>주의사항:</strong> ${data.주의사항}</p>`;
        return html;
    }

    function resetForm() {
        messageInput.value = '';
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        clearImageUpload();
    }

    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function clearImageUpload() {
        imageUpload.value = '';
    }
});