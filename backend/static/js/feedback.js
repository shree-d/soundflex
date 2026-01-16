document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = document.getElementById("message").value;
    const rating = document.getElementById("rating").value;
    const result = document.getElementById("result");

    result.style.color = "white";
    result.innerText = "Submitting feedback...";

    try {
        const res = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",   // ✅ session
            body: JSON.stringify({ message, rating })
        });

        const data = await res.json();

        if (res.ok) {
            result.style.color = "lightgreen";
            result.innerText = "Thank you for your feedback!";
            document.getElementById("feedbackForm").reset();
        } else {
            result.style.color = "red";
            result.innerText = data.error || "Failed to submit feedback";
        }

    } catch (err) {
        result.style.color = "red";
        result.innerText = "Server error";
    }
});
