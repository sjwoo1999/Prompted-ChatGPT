document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const rightBox = document.getElementById('right-box');

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage !== '') {
            displayUserMessage(userMessage);
            updateRightBox(userMessage);
            const botMessage = await sendMessageToServer(rightBox.textContent);
            displayBotMessage(botMessage);
            messageInput.value = '';
        }
    });

    function displayUserMessage(message) {
        const li = document.createElement('li');
        li.textContent = message;
        li.className = 'user-message';
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

    function updateRightBox(message) {
        rightBox.textContent = `${message}에 대해 CoT(Chain-of-Thought) 기법을 활용해서 분석해줘.`;
    }

    async function sendMessageToServer(message) {
        try {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('오류:', error);
            return "죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.";
        }
    }
});