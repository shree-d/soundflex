
document.getElementById("lyricsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const lyrics = document.getElementById("lyricsText").value.trim();
    const result = document.getElementById("result");

    if (!lyrics) {
        result.style.color = "orange";
        result.innerText = "Please enter lyrics";
        return;
    }

    result.style.color = "white";
    result.innerText = "Analyzing lyrics...";

    try {
        const res = await fetch("/api/lyrics-emotion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lyrics })
        });

        const data = await res.json();

        if (res.ok && data.emotion) {
            result.style.color = "lightgreen";
            result.innerHTML = `
                <b>Detected Emotion:</b><br>${data.emotion}
            `;
        } else {
            result.style.color = "orange";
            result.innerText = data.error || "Analysis failed";
        }

    } catch (err) {
        console.error(err);
        result.style.color = "red";
        result.innerText = "Server error";
    }
});

function goHome() {
    window.location.href = "/";
}
