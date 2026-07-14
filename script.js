const toggleButton = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleButton.textContent = '☀️';
    }
}

toggleButton.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleButton.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleButton.textContent = '☀️';
    }
});

// Chatbot Communication Logic
const sendBtn = document.getElementById('send-chat-btn');
const chatInput = document.getElementById('chat-input');
const chatLogs = document.getElementById('chat-logs');
const chatFab = document.getElementById('chat-fab');
const portfolioChat = document.getElementById('portfolio-chat');
const closeChatBtn = document.getElementById('close-chat-btn');

chatFab.addEventListener('click', () => {
    portfolioChat.style.display = 'block';
    chatFab.style.display = 'none';
});

closeChatBtn.addEventListener('click', () => {
    portfolioChat.style.display = 'none';
    chatFab.style.display = 'flex';
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

let isCooldown = false;

async function handleChat() {
    if (isCooldown) return;
    const rawQuery = chatInput.value.trim();
    if (!rawQuery) return;
    
    const query = escapeHTML(rawQuery);

    // UI Rate Limiting: Disable inputs for 3 seconds
    isCooldown = true;
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.7';
    sendBtn.style.cursor = 'not-allowed';

    setTimeout(() => {
        isCooldown = false;
        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
    }, 3000);

    // Display user message
    chatLogs.innerHTML += `<div style="margin-bottom: 8px;"><b>You:</b> ${query}</div>`;
    chatInput.value = '';
    chatLogs.scrollTop = chatLogs.scrollHeight;

    // Add loading indicator
    const loadingId = 'loading-' + Date.now();
    chatLogs.innerHTML += `<div id="${loadingId}" style="margin-bottom: 8px; color: var(--text-secondary);"><i>Bot is typing...</i></div>`;
    chatLogs.scrollTop = chatLogs.scrollHeight;

    try {
        // Set this to your live deployed worker URL
        const res = await fetch('https://portfoliobot.rohitchawda4241.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query })
        });

        const data = await res.json();
        let botReply = data.candidates[0].content.parts[0].text;
        
        botReply = escapeHTML(botReply);
        // Simple markdown bold replacement for better UI
        botReply = botReply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // Remove loading indicator
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        // Display Bot response
        chatLogs.innerHTML += `<div style="margin-bottom: 8px; color: var(--accent-color);"><b>Bot:</b> ${botReply}</div>`;
    } catch (err) {
        // Remove loading indicator
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        chatLogs.innerHTML += `<div style="margin-bottom: 8px; color: red;"><b>Error:</b> Could not reach assistant.</div>`;
    }
    chatLogs.scrollTop = chatLogs.scrollHeight;
}

sendBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
