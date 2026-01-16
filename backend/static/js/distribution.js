document.getElementById("distributionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const artistType = document.getElementById("artistType").value;
    const goal = document.getElementById("goal").value;
    const result = document.getElementById("result");

    let message = "";

    if (goal === "Wide Streaming Reach") {
        message = `
        <b>Recommended Platform:</b> DistroKid<br><br>
        ✔ Fast distribution to many platforms<br>
        ✔ Unlimited uploads<br>
        ✔ Best for independent artists
        `;
    } 
    else if (goal === "Maximum Royalties") {
        message = `
        <b>Recommended Platform:</b> TuneCore<br><br>
        ✔ Artists keep 100% of royalties<br>
        ✔ Strong analytics tools<br>
        ✔ Suitable for professionals
        `;
    } 
    else {
        message = `
        <b>Recommended Platform:</b> CD Baby<br><br>
        ✔ Beginner-friendly<br>
        ✔ One-time payment option<br>
        ✔ Extra services like publishing
        `;
    }

    result.innerHTML = message;
});

function goHome() {
    window.location.href = "/";
}
