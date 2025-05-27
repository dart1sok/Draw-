const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tool = document.getElementById("tool");
const color = document.getElementById("color");
const size = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");

let isDrawing = false;
let startX, startY;
let snapshot = null;

function setupCanvas() {
  ctx.strokeStyle = color.value;
  ctx.lineWidth = size.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateSizeValue();
}
setupCanvas();

function updateSizeValue() {
  sizeValue.textContent = `${size.value}px`;
}

function startDraw(e) {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (tool.value === "pencil" || tool.value === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  } else {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

function drawing(e) {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (tool.value === "eraser") {
    const prevColor = ctx.strokeStyle;
    ctx.strokeStyle = "#ffffff";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = prevColor;
  } else if (tool.value === "pencil") {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();

    switch (tool.value) {
      case "line":
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        break;
      case "rect":
        ctx.rect(startX, startY, x - startX, y - startY);
        break;
      case "circle":
        const radius = Math.sqrt(
          Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
        );
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        break;
      case "triangle":
        ctx.moveTo(startX + (x - startX) / 2, startY);
        ctx.lineTo(x, y);
        ctx.lineTo(startX, y);
        ctx.closePath();
        break;
      case "diamond":
        ctx.moveTo(startX + (x - startX) / 2, startY);
        ctx.lineTo(x, startY + (y - startY) / 2);
        ctx.lineTo(startX + (x - startX) / 2, y);
        ctx.lineTo(startX, startY + (y - startY) / 2);
        ctx.closePath();
        break;
    }
    ctx.stroke();
  }
}

function endDraw() {
  isDrawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseout", endDraw);

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  startDraw({
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  });
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  drawing({
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  });
});

canvas.addEventListener("touchend", endDraw);

color.addEventListener("input", () => {
  ctx.strokeStyle = color.value;
});

size.addEventListener("input", () => {
  ctx.lineWidth = size.value;
  updateSizeValue();
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "малюнок.png";
  link.href = canvas.toDataURL();
  link.click();
});

window.addEventListener("resize", () => {
  canvas.width = Math.min(800, window.innerWidth - 20);
  canvas.height = Math.min(500, window.innerHeight - 150);
  setupCanvas();
});
