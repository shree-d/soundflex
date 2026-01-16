// ================= UPLOAD LOGIC (UNCHANGED) =================
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const result = document.getElementById("result");
    result.style.color = "white";
    result.innerText = "Uploading...";

    const formData = new FormData(e.target);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await res.json();

        if (res.ok && data.status === "accepted") {
            result.style.color = "lightgreen";

            result.style.color = "lightgreen";

            // Generate Dashboard HTML
            let html = `
                <div class="result-grid">
                    <!-- Primary Genre -->
                    <div class="result-card">
                        <h3>Predicted Genre</h3>
                        <div class="main-value">🎵 ${data.predicted_genre}</div>
                    </div>

                    <!-- BPM -->
                    <div class="result-card">
                        <h3>Tempo</h3>
                        <div class="bpm-value">${data.bpm} BPM</div>
                    </div>

                    <!-- Confidence Chart -->
                    <div class="result-card full-width">
                        <h3>Confidence Analysis</h3>
                        <div class="chart-container">
            `;

            data.top_genres.forEach(g => {
                html += `
                    <div class="chart-row">
                        <div class="chart-label">${g.genre}</div>
                        <div class="progress-bg">
                            <div class="progress-fill" style="width: 0%" data-width="${g.confidence}%"></div>
                        </div>
                        <div class="chart-value">${g.confidence}%</div>
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
                </div>
            `;

            result.innerHTML = html;

            // Trigger Animation after a slight delay
            setTimeout(() => {
                const bars = document.querySelectorAll('.progress-fill');
                bars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }, 100);
        } else {
            result.style.color = "orange";
            result.innerText = data.reason || data.error || "Upload rejected";
        }

    } catch (err) {
        result.style.color = "red";
        result.innerText = "Upload failed. Server error.";
        console.error(err);
    }
});


// ================= BACK TO HOME BUTTON LOGIC =================
const homeBtn = document.getElementById("homeBtn");
if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        window.location.href = "/";
    });
}


// ================= WAVEFORM DRAWING (CLIENT SIDE) =================
const canvas = document.getElementById("waveCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const fileInput = document.querySelector("input[type='file']");

if (fileInput && ctx) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) drawWaveform(file);
    });
}

function drawWaveform(file) {
    const reader = new FileReader();

    reader.onload = function () {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(reader.result, buffer => {

            const data = buffer.getChannelData(0);
            const step = Math.ceil(data.length / canvas.width);
            const amp = canvas.height / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#0f1530";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#6f8cff";
            ctx.lineWidth = 1;
            ctx.beginPath();

            for (let i = 0; i < canvas.width; i++) {
                let min = 1.0;
                let max = -1.0;

                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }

                ctx.moveTo(i, (1 + min) * amp);
                ctx.lineTo(i, (1 + max) * amp);
            }

            ctx.stroke();
        });
    };

    reader.readAsArrayBuffer(file);
}
// ================= GO HOME FUNCTION (UNCHANGED) =================
function goHome() {
    window.location.href = "/";
}