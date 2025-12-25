document.addEventListener('DOMContentLoaded', () => {
    const friendsGrid = document.getElementById('friends-container');
    const requestGrid = document.getElementById('request-container');

    // 1. Fetch Friends
    fetch('/social/friends')
        .then(res => {
            if(res.status === 401) return []; 
            return res.json();
        })
        .then(friends => {
            if (!friendsGrid) return;
            friendsGrid.innerHTML = ''; 

            if (!Array.isArray(friends) || friends.length === 0) {
                friendsGrid.innerHTML = '<p style="padding:10px; color:#777;">No friends yet. Add some!</p>';
                return;
            }

            friends.forEach(f => {
                const card = document.createElement('div');
                card.className = 'friend-card';
                
                // Ensure ID is within 1-6 range for images
                const photoId = (f.account_id % 6) + 1;

                card.innerHTML = `
                    <img src="photos/friend${photoId}.jpg" alt="${f.first_name}" onerror="this.src='photos/default.jpg'">
                    <span>${f.first_name} ${f.last_name}</span>
                    <button class="msg-btn" onclick="location.href='dm.html?friendId=${f.account_id}&name=${f.first_name}'">
                        <i class="fa-solid fa-message"></i> Message
                    </button>
                `;
                friendsGrid.appendChild(card);
            });
        })
        .catch(console.error);

    // 2. Fetch Requests (With Random Mock Data & Instant Update Logic)
    if (requestGrid) {
        fetch('/social/friend-requests')
            .then(res => res.json())
            .then(requests => {
                requestGrid.innerHTML = '';

                // --- MOCK DATA GENERATOR ---
                // If backend returns empty, generate 4 random fake requests
                let displayRequests = requests;
                if (!Array.isArray(requests) || requests.length === 0) {
                    displayRequests = [
                        { account_id: 101, first_name: 'Alex', last_name: 'Johnson' },
                        { account_id: 102, first_name: 'Maria', last_name: 'Garcia' },
                        { account_id: 103, first_name: 'Liam', last_name: 'Smith' },
                        { account_id: 104, first_name: 'Emma', last_name: 'Brown' }
                    ];
                }
                // ---------------------------

                displayRequests.forEach(r => {
                    const card = document.createElement('div');
                    card.className = 'friend-card request-card';
                    
                    const photoId = (r.account_id % 6) + 1; // Cycle images 1-6

                    card.innerHTML = `
                        <img src="photos/friend${photoId}.jpg" alt="${r.first_name}" onerror="this.src='photos/default.jpg'">
                        <span>${r.first_name} ${r.last_name}</span>
                        <div class="request-actions">
                            <button class="accept" data-id="${r.account_id}">Accept</button>
                            <button class="decline" data-id="${r.account_id}">Decline</button>
                        </div>
                    `;
                    requestGrid.appendChild(card);
                });

                // --- EVENT LISTENER FOR ACTIONS ---
                requestGrid.addEventListener('click', e => {
                    if (e.target.tagName !== 'BUTTON') return;
                    
                    const btn = e.target;
                    const id = btn.dataset.id;
                    const card = btn.closest('.friend-card');
                    const isMock = id > 100; 

                    if (btn.classList.contains('accept')) {
                        // --- VISUAL UPDATE: Move to Friends List ---
                        const imgSrc = card.querySelector('img').src;
                        const name = card.querySelector('span').textContent;

                        if (friendsGrid) {
                            // Clear "No friends" placeholder if present
                            const placeholder = friendsGrid.querySelector('p');
                            if (placeholder && placeholder.textContent.includes('No friends')) {
                                placeholder.remove();
                            }

                            const newFriendCard = document.createElement('div');
                            newFriendCard.className = 'friend-card';
                            newFriendCard.innerHTML = `
                                <img src="${imgSrc}" alt="${name}">
                                <span>${name}</span>
                                <button class="msg-btn" onclick="location.href='dm.html?friendId=${id}&name=${name}'">
                                    <i class="fa-solid fa-message"></i> Message
                                </button>
                            `;
                            friendsGrid.appendChild(newFriendCard);
                        }

                        // Call API if real
                        if (!isMock) {
                            fetch(`/social/friend-requests/accept/${id}`, { method: 'POST' });
                        }
                    } else if (btn.classList.contains('decline')) {
                        // Call API if real
                        if (!isMock) {
                            fetch(`/social/friend-requests/decline/${id}`, { method: 'POST' });
                        }
                    }

                    // Remove Request Card with animation
                    card.style.transition = "opacity 0.3s";
                    card.style.opacity = '0';
                    setTimeout(() => card.remove(), 300);
                });
            })
            .catch(console.error);
    }
});