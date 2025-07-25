const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let mode = "dark"; // dark | light

let mouseX = width / 2;
let mouseY = height / 2;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.onresize = () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
};

const particles = [];
function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Particle {
  constructor() {
    this.reset();
    this.opacity = random(0.3, 1);
  }

  reset() {
    this.x = random(0, width);
    this.y = height + random(0, 100);
    this.size = random(4, 12);
    this.speed = random(1, 3);
    this.angle = random(0, Math.PI * 2);
    this.type = Math.random() > 0.5 ? "a" : "b";
  }

  update() {
    this.y -= this.speed;
    this.angle += 0.01;
    if (this.y < -20) this.reset();
    this.opacity = Math.max(0.3, Math.sin(this.angle * 5));
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    let offsetX = (this.x - mouseX) * 0.0025;
    let offsetY = (this.y - mouseY) * 0.0025;
    ctx.translate(this.x + offsetX * this.size * 10, this.y + offsetY * this.size * 10);
    ctx.rotate(this.angle);

    if (mode === "dark") {
      this.type === "a" ? drawStar(this.size) : drawHeart(this.size);
    } else {
      this.type === "a" ? drawSun(this.size) : drawFlower(this.size);
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function drawStar(r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r,
               -Math.sin((18 + i * 72) * Math.PI / 180) * r);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * r / 2,
               -Math.sin((54 + i * 72) * Math.PI / 180) * r / 2);
  }
  ctx.closePath();
  ctx.fillStyle = "gold";
  ctx.shadowColor = "rgba(255, 255, 100, 0.8)";
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawHeart(r) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(r, -r, r * 1.5, r, 0, r * 1.5);
  ctx.bezierCurveTo(-r * 1.5, r, -r, -r, 0, 0);
  ctx.fillStyle = "red";
  ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawSun(r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();
}

function drawFlower(r) {
  const petalCount = 12;
  const petalLength = r * 1.2;
  const petalWidth = r * 0.4;

  ctx.fillStyle = "#FFD700";
  for (let i = 0; i < petalCount; i++) {
    let angle = (Math.PI * 2 / petalCount) * i;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r, petalWidth, petalLength, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = "#8B4513";
  ctx.fill();
}

const friendImages = [];
for (let i = 1; i <= 19; i++) {
  friendImages.push({
    src: `image/ban${i}.jpg`,
    message: `Chúc mừng bạn ${i}! Mong bạn luôn thành công và hạnh phúc!`
  });
}

const loadedImages = [];

friendImages.forEach((item) => {
  const img = new Image();
  img.src = item.src;
  img.onload = () => {
    loadedImages.push({
      img,
      x: random(0, width),
      y: random(0, height),
      size: random(140, 180),
      speed: random(0.1, 0.15),
      z: random(0.8, 1.2),
      message: item.message
    });
  };
});

function drawImages() {
  loadedImages.forEach((item) => {
    item.y -= item.speed;
    if (item.y < -item.size) item.y = height + item.size;

    const offsetX = (item.x - mouseX) * 0.0025;
    const offsetY = (item.y - mouseY) * 0.0025;
    const scale = item.z;

    ctx.save();
    ctx.translate(item.x + offsetX * item.size * 10, item.y + offsetY * item.size * 10);
    ctx.scale(scale, scale);
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 15;
    ctx.drawImage(item.img, -item.size / 2, -item.size / 2, item.size, item.size);
    ctx.restore();
  });
}

canvas.addEventListener("click", (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;
  for (const item of loadedImages) {
    const dx = item.x - clickX;
    const dy = item.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < item.size / 2) {
      showMessage(item.message);
      break;
    }
  }
});

function showMessage(msg) {
  const box = document.getElementById("messageBox");
  if (box) {
    box.textContent = msg;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 4000);
  }
}

for (let i = 0; i < 160; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  drawImages();
  requestAnimationFrame(animate);
}
animate();

const toggleBtn = document.getElementById("toggleBtn");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
  mode = document.body.classList.contains("light") ? "light" : "dark";
});

document.body.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
  mode = document.body.classList.contains("light") ? "light" : "dark";
});
