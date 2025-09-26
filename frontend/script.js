document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // Function to add messages to the chat
    function appendMessage(sender, message) {
        const messageElement = document.createElement("p");
        messageElement.classList.add(sender === "Bot" ? "bot-message" : "user-message");
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
    }

    // Function to send user input to backend
    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return; // Prevent empty messages

        appendMessage("You", userMessage);
        userInput.value = ""; // Clear input field

        try {
            const response = await fetch("http://localhost:3000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            if (response.ok) {
                appendMessage("Bot", data.reply);
            } else {
                appendMessage("Bot", "❌ Error: " + (data.error || "Failed to get response"));
            }
        } catch (error) {
            appendMessage("Bot", "❌ Network Error: Unable to reach server.");
        }
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });
});
