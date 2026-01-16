document.getElementById("mixingForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const genre = document.getElementById("genre").value;
    const focus = document.getElementById("focus").value;
    const result = document.getElementById("result");

    let tips = "";

    if (focus === "Vocals") {
        tips = `
• Reduce background noise  
• Apply light compression for consistency  
• Boost clarity using mid frequencies  
• Keep vocals centered in stereo space
        `;
    } 
    else if (focus === "Bass") {
        tips = `
• Control low frequencies to avoid muddiness  
• Use gentle compression  
• Balance bass with kick  
• Avoid overpowering other instruments
        `;
    } 
    else {
        tips = `
• Balance all instruments evenly  
• Avoid clipping and distortion  
• Maintain proper loudness  
• Keep enough headroom for mastering
        `;
    }

    result.innerHTML = `
<b>Genre:</b> ${genre}<br>
<b>Focus:</b> ${focus}<br><br>
<b>Recommended Mixing Tips:</b><br>
<pre>${tips}</pre>
    `;
});

function goHome() {
    window.location.href = "/";
}
