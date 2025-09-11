import fetch from "node-fetch"

export const Log = async (stack, level, pkg, message) => {
    try {
        const response = await fetch("http://localhost:4000/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stack, level, package: pkg, message })
        })

        const data = await response.json();
        console.log("✅ Log sent:", data.message || "Log stored");
    } catch (error) {
        console.log("❌ Failed to send log:", error.message)
    }
}