const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

let centerZ = 1000;
let rotateX = 0;
let rotateY = 0;
let zoom = 1;
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let elements = [];
let starsBackground = [];

const imageSources = [];
for (let i = 1; i <= 19; i++) {
  imageSources.push({
    src: `image/ban${i}.jpg`,
    message: `Bạn ${i} - Chúc bạn luôn hạnh phúc!`
  });
}

function createElements() {
  elements = [];

  // Thêm ảnh như cũ
  for (let i = 0; i < 50; i++) {
    const isImage = Math.random() < 0.6;
    const x = (Math.random() - 0.5) * 1500;
    const y = -Math.random() * height;
    const z = Math.random() * 1600 - 800;

    if (isImage) {
      const imgIndex = Math.floor(Math.random() * imageSources.length);
      const img = new Image();
      img.src = imageSources[imgIndex].src;

      elements.push({
        type: "image",
        img,
        x, y, z,
        size: 160,
        speed: 1 + Math.random(),
        message: imageSources[imgIndex].message
      });
    }
  }

  // Thêm 25 dòng chữ dễ thương, mỗi dòng màu hồng hoặc xanh
  const cuteColors = ["hotpink", "deepskyblue"];
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 1500;
    const y = -Math.random() * height;
    const z = Math.random() * 1600 - 800;
    const color = cuteColors[Math.floor(Math.random() * cuteColors.length)];

    elements.push({
      type: "text",
      text: "Thành công nhé!\n❤️ 2025 ❤️",
      x, y, z,
      color: color,
      font: "bold 26px 'Comic Sans MS', 'Pacifico', cursive",
      speed: 1 + Math.random()
    });
  }
}



function project3D(x, y, z) {
  let dy = y * Math.cos(rotateX) - z * Math.sin(rotateX);
  let dz = y * Math.sin(rotateX) + z * Math.cos(rotateX);
  y = dy; z = dz;

  let dx = x * Math.cos(rotateY) - z * Math.sin(rotateY);
  dz = x * Math.sin(rotateY) + z * Math.cos(rotateY);
  x = dx; z = dz;

  const scale = (centerZ / (centerZ + z)) * zoom;
  return {
    x: width / 2 + x * scale,
    y: height / 2 + y * scale,
    scale
  };
}

class BackgroundStar {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.r = Math.random() * 1.2 + 0.3;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.twinkleSpeed = 0.005 + Math.random() * 0.005;
  }

  update() {
    this.opacity += this.twinkleSpeed;
    if (this.opacity >= 1 || this.opacity <= 0.2) this.twinkleSpeed *= -1;
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

function createBackgroundStars(count = 150) {
  starsBackground = [];
  for (let i = 0; i < count; i++) {
    starsBackground.push(new BackgroundStar());
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Vẽ nền sao phát sáng
  starsBackground.forEach(s => {
    s.update();
    s.draw();
  });

  // Vẽ các phần tử chính (ảnh & chữ bay lơ lửng)
  elements.forEach(el => {
    el.y += el.speed;
    if (el.y > height + 300) el.y = -Math.random() * height - 200;

    const p = project3D(el.x, el.y, el.z);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);

    if (el.type === "image" && el.img.complete) {
      ctx.drawImage(el.img, -el.size / 2, -el.size / 2, el.size, el.size);
    }

    if (el.type === "text") {
  ctx.fillStyle = el.color;
  ctx.font = el.font;
  ctx.textAlign = "center";
  const lines = el.text.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, i * 28);
  });
}



    ctx.restore();
  });

  requestAnimationFrame(draw);
}

createElements();
createBackgroundStars();
draw();

// Zoom bằng cuộn chuột
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoom += e.deltaY * -0.001;
  zoom = Math.max(0.3, Math.min(2.5, zoom));
});

// Xoay bằng chuột
canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});
canvas.addEventListener("mouseup", () => { mouseDown = false; });
canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  rotateY += dx * 0.005;
  rotateX += dy * 0.005;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});
// Biến cho cảm ứng
let touchStartDist = 0;
let initialZoom = zoom;
let lastTouchX = 0;
let lastTouchY = 0;

// Hàm tính khoảng cách 2 ngón tay
function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    // 1 ngón: xoay
    mouseDown = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // 2 ngón: zoom
    touchStartDist = getTouchDist(e.touches);
    initialZoom = zoom;
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && mouseDown) {
    // Xoay bằng 1 ngón tay
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    rotateY += dx * 0.005;
    rotateX += dy * 0.005;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // Zoom bằng 2 ngón tay
    const newDist = getTouchDist(e.touches);
    const zoomFactor = newDist / touchStartDist;
    zoom = initialZoom * zoomFactor;
    zoom = Math.max(0.3, Math.min(2.5, zoom));
  }
}, { passive: false });

canvas.addEventListener("touchend", () => {
  mouseDown = false;
});
