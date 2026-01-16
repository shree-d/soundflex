const output = document.getElementById("output");

async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();

    output.innerHTML = "<h3>Users</h3><ul>";
    data.forEach(u => {
        output.innerHTML += `
            <li>
                ${u.name} (${u.email})
                <button class="delete-btn" onclick="deleteUser('${u.email}')">Delete</button>
            </li>`;
    });
    output.innerHTML += "</ul>";
}

async function deleteUser(email) {
    if (!confirm("Delete this user?")) return;

    await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email })
    });

    loadUsers();
}

async function loadUploads() {
    const res = await fetch("/api/admin/uploads");
    const data = await res.json();

    output.innerHTML = "<h3>Music Uploads</h3><ul>";
    data.forEach(s => {
        output.innerHTML += `<li>${s.username} → ${s.predicted_genre}</li>`;
    });
    output.innerHTML += "</ul>";
}

async function loadLyrics() {
    const res = await fetch("/api/admin/lyrics");
    const data = await res.json();

    output.innerHTML = "<h3>Lyrics Activity</h3><ul>";
    data.forEach(l => {
        output.innerHTML += `<li>${l.username} → ${l.emotion}</li>`;
    });
    output.innerHTML += "</ul>";
}

async function loadFeedback() {
    const res = await fetch("/api/admin/feedbacks");
    const data = await res.json();

    output.innerHTML = "<h3>Feedback</h3><ul>";
    data.forEach(f => {
        output.innerHTML += `<li>${f.username}: ${f.message}</li>`;
    });
    output.innerHTML += "</ul>";
}
