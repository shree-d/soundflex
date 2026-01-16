document.addEventListener("DOMContentLoaded", loadHistory);

async function loadHistory() {
    const tableBody = document.querySelector("#historyTable tbody");

    try {
        const res = await fetch("/api/history", {
            credentials: "include"
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        tableBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No uploads found</td>
                </tr>
            `;
            return;
        }

        data.forEach((item, index) => {
            const fileName = item.file_path?.split("/").pop() || "-";
            const genre = item.predicted_genre || "-";
            const date = item.uploaded_at
                ? new Date(item.uploaded_at).toLocaleString()
                : "-";

            tableBody.insertAdjacentHTML(
                "beforeend",
                `
                <tr>
                    <td>${index + 1}</td>
                    <td>${fileName}</td>
                    <td>${genre}</td>
                    <td>${date}</td>
                </tr>
                `
            );
        });

    } catch (err) {
        console.error("History load failed:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">Error loading history</td>
            </tr>
        `;
    }
}
