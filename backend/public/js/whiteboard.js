const socket = io();
const shareBtn = document.querySelector(".share-room");
const roomCode = document.getElementById("roomCode");
// Gets the username from create room page
const username = localStorage.getItem("username");
// Gets the roomID from create room page
const roomId = localStorage.getItem("roomId");
// Join the Socket.IO room so users can draw with others
socket.emit("join-room", { roomId: roomId, username: username });


const userCountText = document.getElementById("userCountText");
roomCode.textContent = roomId;

socket.on("room-info", (data) => {

  roomCode.textContent = data.roomId;
  userCountText.textContent = data.userCount;

  const userList = document.getElementById("userList");

  if (userList) {
    userList.innerHTML = data.users.join(", ");
  }

});

// listens for drawing events from other users
socket.on("drawing", (data) => {

  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.width;
  ctx.lineCap ="round";

  if (data.tool === "line" || !data.tool) {
    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
  }

  if (data.tool === "rectangle") {
    const x = Math.min(data.x0, data.x1);
    const y = Math.min(data.y0, data.y1);
    const width = Math.abs(data.x1 - data.x0);
    const height = Math.abs(data.y1 - data.y0);
    ctx.strokeRect(x, y, width, height);
  }

  if (data.tool === "circle") {
    const radius = Math.sqrt(
      Math.pow(data.x0 - data.x1, 2) +
      Math.pow(data.y0 - data.y1, 2)
    );
    ctx.beginPath();
    ctx.arc(data.x0, data.y0, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  if (data.tool === "triangle") {
    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.lineTo(data.x0 * 2 - data.x1, data.y1);
    ctx.closePath();
    ctx.stroke();
  }
});

// modified code (GeeksforGeeks, 2024)
const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
const sizeSlider = document.querySelector("#size-slider");
const colorPicker = document.querySelector("#color-picker");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImage = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");

// modified code (Okiramadani, 2023).
socket.on("cursor_move", (data) => {
  let cursorElement = document.getElementById(data.id);

  if (!cursorElement) {
    cursorElement = document.createElement("div");
    cursorElement.id = data.id;
    cursorElement.className = "username-cursor";
    document.body.appendChild(cursorElement);
  }

  cursorElement.innerText = data.username;
  cursorElement.style.left = canvas.offsetLeft + data.x + "px";
  cursorElement.style.top = canvas.offsetTop + data.y + "px";
});

socket.on("user_disconnect", (id) => {
  const cursorElement = document.getElementById(id);
  if (cursorElement) cursorElement.remove();
});
// modified code (Okiramadani, 2023).

// draws state variables
let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "pencil";
let brushWidth = 5;
let selectedColor = "#000";

// canvas bg colour
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

// canvas size
window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const drawRect = (e) => {
  const x = Math.min(prevMouseX, e.offsetX);
  const y = Math.min(prevMouseY, e.offsetY);
  const width = Math.abs(prevMouseX - e.offsetX);
  const height = Math.abs(prevMouseY - e.offsetY);
  ctx.strokeRect(x, y, width, height);
};

const drawCircle = (e) => {
  ctx.beginPath();
  const radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) +
    Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  ctx.stroke();
};

const drawLine = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;

  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawPencil = (e) => {
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};



const drawing = (e) => {
  if (!isDrawing) return;

  if (selectedTool === "pencil" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineWidth = brushWidth; // AI debugged code
    
    const newX = e.offsetX;
    const newY = e.offsetY;

    ctx.beginPath(); // AI debugged code
    ctx.moveTo(prevMouseX, prevMouseY); // AI debugged code
    ctx.lineTo(newX, newY);
    ctx.stroke();

    socket.emit("drawing", {
      roomId: roomId,
      x0: prevMouseX,
      y0: prevMouseY,
      x1: newX,
      y1: newY,
      color: selectedTool === "eraser" ? "#fff" : selectedColor,
      width: brushWidth
    });

    prevMouseX = newX;
    prevMouseY = newY;
    
    return;
  }

  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else if (selectedTool === "triangle") {
    drawTriangle(e);
  } else if (selectedTool === "line") {
    drawLine(e);
  }
};

// Change the active drawing tool when a toolbar button is clicked
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool").forEach((tool) => {
      tool.classList.remove("active");
    });

    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

// updates brush size when user uses the slider
sizeSlider.addEventListener("change", () => {
  brushWidth = sizeSlider.value;
});

// Update drawing colour from the colour picker
colorPicker.addEventListener("change", () => {
  selectedColor = colorPicker.value;
});

clearCanvas.addEventListener("click", () => {
  if (!confirm("This will clear the canvas for only you. Continue?")) {
    return;
  }
  ctx.clearRect(0,0, canvas.width, canvas.height);
  setCanvasBackground();

  socket.emit("clear", roomId);
});

// download canvas as an image
saveImage.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
});

// mouse contols
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
// modified code (Okiramadani, 2023).
canvas.addEventListener("mousemove", (e) => {
  socket.emit("cursor_move", {
    roomId: roomId,
    x: e.offsetX,
    y: e.offsetY,
    username: username
  });
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDrawing) return;
  isDrawing = false;

  if (
    selectedTool === "rectangle" ||
    selectedTool === "circle" ||
    selectedTool === "triangle" ||
    selectedTool === "line" 
  ) {
    socket.emit("drawing", {
      roomId: roomId,
      tool: selectedTool,
      x0: prevMouseX,
      y0: prevMouseY,
      x1: e.offsetX,
      y1: e.offsetY,
      color: selectedColor,
      width: brushWidth
    });
  }
});

// stop drawing if thr mouse leaves the canvas
canvas.addEventListener("mouseleave", () => (isDrawing = false));
// touch for phones/tablers
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", drawing);
canvas.addEventListener("touchend", () => (isDrawing = false));

