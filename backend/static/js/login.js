document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      message.style.color = "lightgreen";
      message.innerText = "Login successful! Redirecting...";

      // ✅ REDIRECT TO UPLOAD PAGE (FROM BACKEND)
      setTimeout(() => {
        window.location.href = data.redirect; // "/upload"
      }, 800);

    } else {
      message.style.color = "red";
      message.innerText = data.message;
    }

  } catch (err) {
    message.style.color = "red";
    message.innerText = "Server error";
  }
});
