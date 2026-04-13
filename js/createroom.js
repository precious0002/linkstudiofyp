// select elements from page
const usernameInput = document.getElementById("username");
const roomInput = document.getElementById("roomId");
const generateBtn = document.getElementById("generate-btn");
const createBtn = document.getElementById("createBtn");
const errorText = document.getElementById("error");

// generates a random 6 character roomID when the user clicks generate button
generateBtn.addEventListener("click", () => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  roomInput.value = code;
  errorText.textContent = "";
});

// for creating/joing room
createBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const roomId = roomInput.value.trim();

  // Validate input fields to ensure they are not empty
  if (!username) {
    errorText.textContent = "Please enter a username.";
    return;
  }

  if (!roomId) {
    errorText.textContent = "Please enter or generate a room ID.";
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("roomId", roomId);

  errorText.textContent = "";
  window.location.href = "whiteboard.html";
});