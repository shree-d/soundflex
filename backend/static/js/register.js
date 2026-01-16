document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("❌ registerForm not found in HTML");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    console.log("📤 Sending data:", { name, email, password });

    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      console.log("📥 Server response:", data);

      if (data.success) {
        message.style.color = "lightgreen";
        message.innerText = "Registration successful!";
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        message.style.color = "red";
        message.innerText = data.message;
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      message.style.color = "red";
      message.innerText = "Server error";
    }
  });
});
