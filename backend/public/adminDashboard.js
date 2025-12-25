/* ============================
    ADMIN DASHBOARD JS
============================ */

const API_BASE_URL = "http://localhost:3000";

// ----------------------------
// Utility Helpers
// ----------------------------
async function apiGet(url) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    try {
        const res = await fetch(fullUrl, { credentials: 'include', headers: { 'Accept': 'application/json' } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) { console.error(err); return null; }
}

async function apiCall(url, method, body = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    try {
        const res = await fetch(fullUrl, {
            method: method,
            credentials: 'include',
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) { console.error(err); return null; }
}

// WRAP EVERYTHING IN DOMContentLoaded TO ENSURE HTML EXISTS
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard Script Started");

    /* =======================================================
       1. MANAGE USERS
    ======================================================= */
    const popupUserList = document.getElementById("userListPopup");
    const popupSearchBtn = document.getElementById("popupUserSearchBtn");
    const popupSearchInput = document.getElementById("popupUserSearchInput");

    function renderUserCards(users) {
        if (!popupUserList) return;
        popupUserList.innerHTML = "";
        if (users.length === 0) {
            popupUserList.innerHTML = "<p>No users found.</p>";
            return;
        }

        users.forEach(user => {
            const isBanned = user.role === 'Banned';
            const card = document.createElement("div");
            card.className = "user-card";
            card.innerHTML = `
            <div>
                <h4>${user.username}</h4>
                <p>Email: ${user.email}</p>
                <p>Status: ${user.role}</p> 
            </div>
            <div class="user-actions">
                <button class="ban-btn" data-account-id="${user.account_id}" style="display: ${isBanned ? 'none' : 'inline-block'}">Ban</button>
                <button class="unban-btn" data-account-id="${user.account_id}" style="display: ${isBanned ? 'inline-block' : 'none'}">Unban</button>
                <button class="delete-user-btn" data-account-id="${user.account_id}">Delete</button>
            </div>`;
            popupUserList.appendChild(card);
        });
    }

    async function loadAllUsers() {
        const users = await apiGet("/admin/users");
        if (users && Array.isArray(users)) renderUserCards(users);
    }
    loadAllUsers(); 

    if(popupSearchBtn) {
        popupSearchBtn.addEventListener("click", async () => {
            const query = popupSearchInput.value.trim();
            const allUsers = await apiGet(`/admin/users`);
            if (!allUsers) return;
            const filtered = allUsers.filter(u =>
                u.username.toLowerCase().includes(query.toLowerCase()) ||
                u.email.toLowerCase().includes(query.toLowerCase())
            );
            renderUserCards(filtered);
        });
    }

    if(popupUserList) {
        popupUserList.addEventListener("click", async (e) => {
            const btn = e.target;
            const id = btn.dataset.accountId;
            if (!id) return;

            if (btn.classList.contains("ban-btn")) {
                await apiCall(`/admin/users/ban/${id}`, "PUT");
                btn.style.display = "none";
                btn.parentNode.querySelector(".unban-btn").style.display = "inline-block";
            }
            if (btn.classList.contains("unban-btn")) {
                await apiCall(`/admin/users/unban/${id}`, "PUT");
                btn.style.display = "none";
                btn.parentNode.querySelector(".ban-btn").style.display = "inline-block";
            }
            if (btn.classList.contains("delete-user-btn")) {
                if(confirm("Are you sure?")) {
                    await apiCall(`/admin/users/${id}`, "DELETE");
                    btn.closest(".user-card").remove();
                }
            }
        });
    }


    /* =======================================================
       2. FLAGGED CONTENT
    ======================================================= */
    const flaggedList = document.getElementById("flaggedList");
    const recentTableBody = document.getElementById("recentFlagsTableBody");

    async function loadFlaggedContent() {
        const data = await apiGet("/admin/flags");
        if (!data || !Array.isArray(data)) return;

        // POPULATE MODERATION POPUP LIST
        if (flaggedList) {
            flaggedList.innerHTML = "";
            data.forEach(f => {
                const card = document.createElement("div");
                card.className = "flag-card";
                card.style.cursor = "pointer";
                card.innerHTML = `
                    <div>
                        <h4>User: ${f.reporter_name || 'ID ' + f.reporter_id}</h4>
                        <p class="small-muted">Type: ${f.content_type}</p>
                        <p class="small-muted">Status: ${f.status}</p>
                    </div>
                    <p class="flag-reason">Reason: ${f.reason}</p>
                `;
                card.addEventListener("click", () => openFlagPopup(f));
                flaggedList.appendChild(card);
            });
        }

        if (recentTableBody) {
            recentTableBody.innerHTML = "";
            const recentItems = data.slice(0, 5); 

            recentItems.forEach(f => {
                const row = document.createElement("tr");
                const dateStr = new Date(f.created_at).toLocaleDateString() + ' ' + 
                                new Date(f.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                row.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${f.reporter_name || f.reporter_id}</td>
                    <td>${f.content_type}</td>
                    <td>${f.reason}</td>
                    <td><span class="status-${f.status.toLowerCase()}">${f.status}</span></td>
                    <td><button class="review-btn-table">Review</button></td>
                `;

                const btn = row.querySelector(".review-btn-table");
                btn.style.cursor = "pointer";
                btn.style.color = "blue";
                btn.style.textDecoration = "underline";
                btn.style.background = "none";
                btn.style.border = "none";
                
                btn.addEventListener("click", (e) => {
                    e.preventDefault(); 
                    openFlagPopup(f); 
                });

                recentTableBody.appendChild(row);
            });
        }
    }
    loadFlaggedContent();

    function openFlagPopup(flag) {
        document.getElementById("popupFlagType").innerText = flag.content_type;
        document.getElementById("popupFlagReason").innerText = flag.reason;
        document.getElementById("popupFlagContent").innerText = `Content ID: ${flag.content_id}`;
        
        const approveBtn = document.getElementById("dynamicApproveBtn");
        const removeBtn = document.getElementById("dynamicRemoveBtn");
        
        if (approveBtn) approveBtn.dataset.flagId = flag.flag_id;
        if (removeBtn) removeBtn.dataset.flagId = flag.flag_id;

        window.location.hash = "dynamicFlagPopup";
    }

    document.body.addEventListener("click", async (e) => {
        if (e.target.id === "dynamicApproveBtn") {
            const id = e.target.dataset.flagId;
            await apiCall(`/admin/flags/${id}/resolve`, "PUT");
            loadFlaggedContent();
            window.location.hash = "moderation"; 
        }
        if (e.target.id === "dynamicRemoveBtn") {
            const id = e.target.dataset.flagId;
            await apiCall(`/admin/flags/${id}/remove`, "DELETE");
            loadFlaggedContent();
            window.location.hash = "moderation"; 
        }
    });

    /* =======================================================
       3. RESTRICTED WORDS
    ======================================================= */
    const restrictedList = document.getElementById("restrictedWordsList");
    const addRestrictedBtn = document.getElementById("addRestrictedBtn");
    const restrictedInput = document.getElementById("restrictedInput");

    async function loadRestrictedWords() {
        const data = await apiGet("/admin/restricted");
        if (!data || !Array.isArray(data)) return;
        if (!restrictedList) return;

        restrictedList.innerHTML = "";
        data.forEach(w => {
            const tag = document.createElement("span");
            tag.className = "word-tag";
            tag.innerHTML = `${w.word} <button class="delete-word" data-word-id="${w.word_id}">×</button>`;
            restrictedList.appendChild(tag);
        });
    }
    loadRestrictedWords();

    if(addRestrictedBtn) {
        addRestrictedBtn.addEventListener("click", async () => {
            const word = restrictedInput.value.trim();
            if (!word) return;
            await apiCall("/admin/restricted", "POST", { word });
            restrictedInput.value = "";
            loadRestrictedWords();
        });
    }

    if(restrictedList) {
        restrictedList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("delete-word")) {
                const id = e.target.dataset.wordId;
                await apiCall(`/admin/restricted/${id}`, "DELETE");
                loadRestrictedWords();
            }
        });
    }

    /* =======================================================
       5. DASHBOARD OVERVIEW STATS (Placed Here)
    ======================================================= */
    async function loadDashboardStats() {
        console.log("Fetching dashboard stats...");
        const data = await apiGet("/admin/overview");

        if (!data) return;

        // 1. Total Users Card
        if (document.getElementById("totalUsersValue")) 
            document.getElementById("totalUsersValue").innerText = data.totalUsers.toLocaleString();
        if (document.getElementById("active30days")) 
            document.getElementById("active30days").innerText = data.newSignups24h; 

        // 2. Total Movies Card
        if (document.getElementById("totalMoviesValue")) 
            document.getElementById("totalMoviesValue").innerText = data.totalMovies.toLocaleString();
        if (document.getElementById("totalGenres")) 
            document.getElementById("totalGenres").innerText = data.totalGenres;

        // 3. Total Reviews Card
        if (document.getElementById("totalReviewsValue")) 
            document.getElementById("totalReviewsValue").innerText = data.totalReviews.toLocaleString();
        if (document.getElementById("avgRating")) 
            document.getElementById("avgRating").innerText = data.avgRating;

        // 4. Pending Flags Card
        if (document.getElementById("pendingFlagsValue")) 
            document.getElementById("pendingFlagsValue").innerText = data.pendingFlags;
        
        // 5. Update the "System Activity" small text below
        if (document.getElementById("statSignups24h")) 
            document.getElementById("statSignups24h").innerText = data.newSignups24h;
        if (document.getElementById("statReviews24h")) 
            document.getElementById("statReviews24h").innerText = data.reviews24h;
        if (document.getElementById("statEvents24h")) 
            document.getElementById("statEvents24h").innerText = data.events24h;
    }

    // Call it immediately upon load
    loadDashboardStats();

});