document.addEventListener('DOMContentLoaded', () => {
    const historyRow = document.querySelector('.movie-row');

    function loadHistory() {
        // Note: Added /social prefix
        fetch('/social/history')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(history => {
                if (!Array.isArray(history)) return;

                historyRow.innerHTML = ''; // Clear and redraw
                history.forEach(h => {
                    const card = document.createElement('div');
                    card.className = 'movie-card';
                    card.innerHTML = `
                        <img src="${h.poster || 'photos/default.jpg'}" alt="${h.title}">
                        <h3>${h.title}</h3>
                        <p>Completed: <span>${new Date(h.watched_date).toLocaleDateString()}</span></p>
                    `;
                    historyRow.appendChild(card);
                });
            })
            .catch(err => console.error('Error fetching history:', err));
    }

    // Initial Load
    loadHistory();

    // Poll every 5 seconds (Replaces Socket.on)
    setInterval(loadHistory, 5000);
});