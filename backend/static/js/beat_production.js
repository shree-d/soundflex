const generateBtn = document.getElementById("generateBtn");
const beatGenre = document.getElementById("beatGenre");
const beatVibe = document.getElementById("beatVibe");

const recipeGrid = document.getElementById("recipeGrid");
const loadingOverlay = document.getElementById("loadingOverlay");

// Output Elements
const outDrum = document.getElementById("outDrum");
const outInst = document.getElementById("outInst");
const outMix = document.getElementById("outMix");
const outArr = document.getElementById("outArr");

generateBtn.addEventListener("click", async () => {
    const genre = beatGenre.value;
    const vibe = beatVibe.value.trim();

    if (!vibe) return alert("Please describe the vibe!");

    // UI Loading
    generateBtn.disabled = true;
    loadingOverlay.style.display = "block";
    recipeGrid.style.display = "none";

    try {
        const res = await fetch("/api/generate-beat-recipe", {
            method: "POST",
            body: JSON.stringify({ genre, vibe }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt);
        }

        const data = await res.json();

        // Parse the markdown/text response into sections
        // We expect the backend to return JSON keys: drums, instruments, mixing, arrangement
        // OR structured text we parse. Let's assume the backend does the heavy lifting or returns structured JSON.

        if (data.recipe) {
            // Populate cards
            outDrum.innerHTML = formatText(data.recipe.drums);
            outInst.innerHTML = formatText(data.recipe.instruments);
            outMix.innerHTML = formatText(data.recipe.mixing);
            outArr.innerHTML = formatText(data.recipe.arrangement);
        } else {
            throw new Error("Invalid response format");
        }

        loadingOverlay.style.display = "none";
        recipeGrid.style.display = "grid";

    } catch (err) {
        alert("Error: " + err.message);
        loadingOverlay.style.display = "none";
    } finally {
        generateBtn.disabled = false;
    }
});

function formatText(text) {
    if (!text) return "No data generated.";
    // Convert newlines to breaks and bold markdown to HTML bold
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}
