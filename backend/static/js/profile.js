document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const bio = document.getElementById("bio").value;
    const location = document.getElementById("location").value;
    const message = document.getElementById("message");

    message.style.color = "white";
    message.innerText = "Updating profile...";

    try {
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",   // ✅ VERY IMPORTANT
            body: JSON.stringify({
                bio: bio,
                location: location
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            message.style.color = "lightgreen";
            message.innerText = "Profile updated successfully!";
        } else {
            message.style.color = "red";
            message.innerText = data.error || "Update failed";
        }

    } catch (err) {
        console.error("Profile update error:", err);
        message.style.color = "red";
        message.innerText = "Update failed";
    }
});
