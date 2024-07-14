document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const rightBox = document.getElementById('right-box');
    const leftBox = document.getElementById('left-box');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    leftBox.textContent = "{입력된 메시지}에 대해 CoT(Chain-of-Thought) 기법을 활용해서 분석해줘.";

    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
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
            displayUserMessage(userMessage, imageSrc);
            updateRightBox(userMessage, imageSrc);
            const botMessage = await sendMessageToServer(rightBox.innerHTML);
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
        rightBox.innerHTML = `${message}에 대해 CoT(Chain-of-Thought) 기법을 활용해서 분석해줘.`;
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'right-box-image';
            rightBox.appendChild(img);
        }
    }

    async function sendMessageToServer(message) {
        try {
            const formData = new FormData();
            formData.append('message', message);
            if (imageUpload.files.length > 0) {
                formData.append('image', imageUpload.files[0]);
            }

            const response = await fetch('/api/message', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 429) {
                    return "API 사용량 초과로 인해 일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
                } else {
                    throw new Error(data.error || `HTTP error! status: ${response.status}`);
                }
            }
            return data.response;
        } catch (error) {
            console.error('오류:', error);
            return "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        }
    }
});