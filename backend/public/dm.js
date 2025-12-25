document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Friend ID from URL (set by friends.js)
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get('friendId');
    const friendName = urlParams.get('name');

    if(friendName) {
        // Optional: Update header with friend's name if you have an element for it
        // document.getElementById('chat-header').innerText = friendName;
    }

    const sendBtn = document.querySelector('.send-box button');
    const input = document.querySelector('.send-box input');
    const messagesContainer = document.querySelector('.messages');

    // 2. Function to Send Message
    sendBtn.addEventListener('click', async () => {
        const msgText = input.value.trim();
        if (!msgText || !friendId) return;

        try {
            await fetch('/social/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    receiverId: friendId, 
                    text: msgText 
                })
            });
            input.value = '';
            loadMessages(); // Refresh immediately
        } catch (err) {
            console.error("Failed to send", err);
        }
    });

    // 3. Function to Load Messages
    async function loadMessages() {
        if(!friendId) return;
        
        try {
            const res = await fetch(`/social/messages/${friendId}`);
            const msgs = await res.json();

            messagesContainer.innerHTML = ''; // Clear current
            msgs.forEach(msg => {
                const div = document.createElement('div');
                // msg.type comes from the server ('outgoing' or 'incoming')
                div.classList.add('msg', msg.type); 
                div.innerHTML = `<p>${msg.text}</p>`;
                messagesContainer.appendChild(div);
            });
            
            // Auto scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (err) {
            console.error("Error loading chat", err);
        }
    }

    // 4. Initial Load & Polling (Replaces Socket)
    loadMessages();
    setInterval(loadMessages, 3000); // Check for new messages every 3 seconds
});