import { StateManager } from "../systems/StateManager";
import { HomeHub } from "./HomeHub";
import { drawMonster } from "../Monsters/drawMonster";
import { monsterRegistry } from "../Monsters/monsterRegistry";

type Cloud = {
  x: number;
  y: number;
  size: number;
  speed: number;
};

export class LoginScreen {
  manager: StateManager;

  time = 0;

  mouseX = 0;
  mouseY = 0;
  isHoveringStart = false;

  isTransitioning = false;
  transitionTimer = 0;
  transitionDuration = 0.72;

  startButtonBounds = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  clouds: Cloud[] = [];

  monsterImages: Partial<
    Record<"SQUNCH" | "KANGASHOE" | "SPARKY", HTMLImageElement>
  > = {};

  constructor(manager: StateManager) {
    this.manager = manager;

  this.clouds = [
  { x: 90, y: 72, size: 0.9, speed: 0.08 },
  { x: 280, y: 122, size: 1.15, speed: 0.05 },
  { x: 520, y: 86, size: 0.8, speed: 0.07 },
  { x: 760, y: 138, size: 1.25, speed: 0.04 },
  { x: 1040, y: 102, size: 1.0, speed: 0.06 },
];

    const overworldMonsterIds: ("SQUNCH" | "KANGASHOE" | "SPARKY")[] = [
      "SQUNCH",
      "KANGASHOE",
      "SPARKY",
    ];

    for (const id of overworldMonsterIds) {
      const def = monsterRegistry[id];
      if (!def || !def.imageSrc) continue;

      const img = new Image();
      img.src = def.imageSrc;
      this.monsterImages[id] = img;
    }

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
  }

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.isHoveringStart =
      this.mouseX >= this.startButtonBounds.x &&
      this.mouseX <= this.startButtonBounds.x + this.startButtonBounds.width &&
      this.mouseY >= this.startButtonBounds.y &&
      this.mouseY <= this.startButtonBounds.y + this.startButtonBounds.height;
  };

  handleClick = () => {
    if (!this.isHoveringStart || this.isTransitioning) return;

    this.isTransitioning = true;
    this.transitionTimer = 0;
  };

  update() {
    const dt = 0.016;
    this.time += dt;

   for (const cloud of this.clouds) {
  cloud.x += cloud.speed;

  for (const cloud of this.clouds) {
  cloud.x += cloud.speed;

  const cloudWidth = 15 * 10 * cloud.size;
  if (cloud.x > 1280 + cloudWidth) {
    cloud.x = -cloudWidth - Math.random() * 120;
  }
}

    if (this.isTransitioning) {
      this.transitionTimer += dt;

      if (this.transitionTimer >= this.transitionDuration) {
        this.destroy();
        this.manager.setState(new HomeHub(this.manager));
        return;
      }
    }
  }
}

  private snap(n: number) {
    return Math.round(n);
  }

  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }


    private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeInCubic(t: number) {
    return t * t * t;
  }

  private drawLoginTransition(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.isTransitioning) return;

    const t = this.clamp(this.transitionTimer / this.transitionDuration, 0, 1);
    const burst = this.easeOutCubic(Math.min(1, t * 1.35));
    const fade = this.easeInCubic(t);

    const cx = this.startButtonBounds.x + this.startButtonBounds.width / 2;
    const cy = this.startButtonBounds.y + this.startButtonBounds.height / 2;

    // expanding radial flash from button
    ctx.save();
    const radius = 40 + burst * Math.max(width, height) * 1.15;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255,255,255,${0.95 - fade * 0.35})`);
    grad.addColorStop(0.2, `rgba(255,240,170,${0.8 - fade * 0.3})`);
    grad.addColorStop(0.45, `rgba(255,210,70,${0.45 - fade * 0.2})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // horizontal pixel wipe bars
    const barsProgress = this.clamp((t - 0.12) / 0.55, 0, 1);
    const barsWidth = width * barsProgress;

    for (let i = 0; i < 11; i++) {
      const barH = 18;
      const gap = 20;
      const y = 50 + i * (barH + gap);
      const offset = (i % 2 === 0 ? 1 : -1) * (1 - barsProgress) * 140;

      this.drawPixelRect(
        ctx,
        width / 2 - barsWidth / 2 + offset,
        y,
        barsWidth,
        barH,
        i % 2 === 0 ? "#ffe082" : "#fff7cf",
        0.18 + barsProgress * 0.32
      );
    }

    // final white fade
    this.drawPixelRect(ctx, 0, 0, width, height, "#ffffff", Math.max(0, t - 0.45) / 0.55);
  }


  private drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    alpha: number = 1
  ) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(this.snap(x), this.snap(y), this.snap(w), this.snap(h));
    ctx.globalAlpha = 1;
  }

  private getSunPosition(width: number) {
    return {
      x: width - 174,
      y: 152,
    };
  }

  private drawGroundEllipseShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number = 0.22
  ) {
    ctx.save();

    const grad = ctx.createRadialGradient(x, y, 0, x, y, width);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(0.7, `rgba(0,0,0,${alpha * 0.35})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawProjectedShadow(
    ctx: CanvasRenderingContext2D,
    width: number,
    leftX: number,
    rightX: number,
    baseY: number,
    objectHeight: number,
    alpha: number = 0.16,
    lengthMul: number = 1.5
  ) {
    const sun = this.getSunPosition(width);

    const midX = (leftX + rightX) * 0.5;
    const dx = midX - sun.x;
    const dy = baseY - sun.y;

    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / len;
    const dirY = dy / len;

    const shadowLength = objectHeight * lengthMul;

    const farLeftX = leftX + dirX * shadowLength;
    const farLeftY = baseY + dirY * shadowLength;
    const farRightX = rightX + dirX * shadowLength;
    const farRightY = baseY + dirY * shadowLength;

    ctx.save();

    const grad = ctx.createLinearGradient(
      (leftX + rightX) * 0.5,
      baseY,
      (farLeftX + farRightX) * 0.5,
      (farLeftY + farRightY) * 0.5
    );
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(0.55, `rgba(0,0,0,${alpha * 0.5})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(this.snap(leftX), this.snap(baseY));
    ctx.lineTo(this.snap(rightX), this.snap(baseY));
    ctx.lineTo(this.snap(farRightX), this.snap(farRightY));
    ctx.lineTo(this.snap(farLeftX), this.snap(farLeftY));
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawPixelSparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    freqOffset: number = 0
  ) {
    const flicker = 0.72 + Math.sin(this.time * 3 + freqOffset) * 0.18;
    const p = 2;

    this.drawPixelRect(ctx, x, y, p, p, color, flicker);
    this.drawPixelRect(ctx, x, y - p, p, p, color, flicker * 0.7);
    this.drawPixelRect(ctx, x, y + p, p, p, color, flicker * 0.7);
    this.drawPixelRect(ctx, x - p, y, p, p, color, flicker * 0.7);
    this.drawPixelRect(ctx, x + p, y, p, p, color, flicker * 0.7);
  }

  private drawSky(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // ============================================
  // SKY GRADIENT (top → horizon → ground glow)
  // ============================================

  this.drawPixelRect(ctx, 0, 0, width, height * 0.12, "#b8f4f6"); // deep top blue
  this.drawPixelRect(ctx, 0, height * 0.12, width, height * 0.14, "#93e6fb");
  this.drawPixelRect(ctx, 0, height * 0.24, width, height * 0.12, "#70c8f7");
  this.drawPixelRect(ctx, 0, height * 0.36, width, height * 0.10, "#3abaf5");

  // ============================================
  // HORIZON GLOW (warm light band)
  // ============================================

  this.drawPixelRect(ctx, 0, height * 0.46, width, height * 0.08, "#3293cb");
  this.drawPixelRect(ctx, 0, height * 0.54, width, height * 0.06, "#4c2e1c");

  // ============================================
  // ATMOSPHERIC FADE INTO WORLD
  // ============================================

  this.drawPixelRect(ctx, 0, height * 0.60, width, height * 0.16, "#106124");
  }


  private drawSun(ctx: CanvasRenderingContext2D, width: number) {
    const px = 10;
    const sunX = width - 240;
    const sunY = 86 + Math.sin(this.time * 0.4) * 2;

    this.drawPixelRect(ctx, sunX - 16, sunY - 16, 132, 132, "#487f18", 0.12);

    const pattern = [
      "00001111110000",
      "00011111111100",
      "00111111111110",
      "01111111111111",
      "01111111111111",
      "11111111111111",
      "11111111111111",
      "11111111111111",
      "11111111111111",
      "01111111111111",
      "01111111111111",
      "00111111111110",
      "00011111111100",
      "00001111110000",
    ];

    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] !== "1") continue;

        const isCore = row > 3 && row < 10 && col > 3 && col < 10;
        this.drawPixelRect(
          ctx,
          sunX + col * px,
          sunY + row * px,
          px,
          px,
          isCore ? "#fff3ab" : "#ffd851"
        );
      }
    }

    this.drawPixelRect(ctx, sunX + 50, sunY - 28, 40, 10, "#fff2ba", 0.9);
    this.drawPixelRect(ctx, sunX + 50, sunY + 158, 40, 10, "#fff2ba", 0.9);
    this.drawPixelRect(ctx, sunX - 28, sunY + 50, 10, 40, "#fff2ba", 0.9);
    this.drawPixelRect(ctx, sunX + 158, sunY + 50, 10, 40, "#fff2ba", 0.9);
  }

  private drawPixelCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  const px = 10 * scale;
  const driftY = Math.sin(this.time * 0.28 + x * 0.01) * 3;
  const finalY = y + driftY;

  const shape = [
    "000001111100000",
    "000111111111000",
    "001111111111110",
    "011111111111111",
    "111111111111111",
    "111111111111111",
    "011111111111110",
    "001111111111100",
  ];

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== "1") continue;

      let color = "#ffffff";

      if (row >= 5) color = "#d9f6ff";
      else if (row >= 3) color = "#eefcff";
      else color = "#ffffff";

      this.drawPixelRect(
        ctx,
        x + col * px,
        finalY + row * px,
        px,
        px,
        color
      );
    }
  }

  this.drawPixelRect(
    ctx,
    x + 3 * px,
    finalY + 6 * px,
    7 * px,
    1 * px,
    "#bde9f7",
    0.9
  );

  this.drawPixelRect(
    ctx,
    x + 5 * px,
    finalY + 1 * px,
    3 * px,
    1 * px,
    "#ffffff",
    0.8
  );
}
  private drawClouds(ctx: CanvasRenderingContext2D) {
    const sortedClouds = [...this.clouds].sort((a, b) => a.size - b.size);

    for (const cloud of sortedClouds) {
      this.drawPixelCloud(ctx, cloud.x, cloud.y, cloud.size);
    }
  }

  private drawMountains(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const baseY = height * 0.58;

    for (let i = -1; i < 8; i++) {
      const x = i * 220;

      ctx.fillStyle = "#6b8ca0";
      ctx.beginPath();
      ctx.moveTo(this.snap(x), this.snap(baseY));
      ctx.lineTo(this.snap(x + 110), this.snap(baseY - 140));
      ctx.lineTo(this.snap(x + 220), this.snap(baseY));
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#9eb9c8";
      ctx.beginPath();
      ctx.moveTo(this.snap(x + 68), this.snap(baseY - 72));
      ctx.lineTo(this.snap(x + 110), this.snap(baseY - 140));
      ctx.lineTo(this.snap(x + 145), this.snap(baseY - 68));
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawTreeLine(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const baseY = height * 0.64;

    for (let i = -1; i < 18; i++) {
      const x = i * 80;

      this.drawGroundEllipseShadow(ctx, x + 31, baseY + 4, 20, 7, 0.16);

      this.drawPixelRect(ctx, x + 26, baseY - 34, 10, 34, "#4b331d");
      this.drawPixelRect(ctx, x + 12, baseY - 68, 40, 22, "#2d6a2f");
      this.drawPixelRect(ctx, x + 6, baseY - 50, 52, 20, "#377936");
      this.drawPixelRect(ctx, x + 16, baseY - 86, 32, 20, "#4b9743");
    }
  }

  private drawCity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const baseY = height * 0.73;

  const buildings = [
    { x: 450, w: 58, h: 88, body: "#e5dcc7", roof: "#c75d3b" },
    { x: 515, w: 74, h: 126, body: "#efe6d4", roof: "#4474c9" },
    { x: 596, w: 62, h: 96, body: "#e9dec9", roof: "#d59a33" },
    { x: 664, w: 82, h: 148, body: "#f2ead8", roof: "#cc5a3d" },
    { x: 756, w: 66, h: 106, body: "#e7ddc9", roof: "#d77a2c" },
    { x: 832, w: 86, h: 160, body: "#efe5d1", roof: "#4862c2" },
    { x: 930, w: 68, h: 118, body: "#eadfc9", roof: "#d8892f" },
    { x: 1008, w: 94, h: 182, body: "#f4ead8", roof: "#cf6a32" },
  ];

  const drawSteppedRoof = (
    x: number,
    y: number,
    w: number,
    roofColor: string
  ) => {
    const roofH = 40;

    this.drawPixelRect(ctx, x - 8, y - 4, w + 16, 4, "#5d341c");

    this.drawPixelRect(ctx, x + 4, y - 8, w - 8, 8, roofColor);
    this.drawPixelRect(ctx, x - 2, y - 16, w + 4, 8, roofColor);
    this.drawPixelRect(ctx, x + 10, y - 24, w - 20, 8, roofColor);
    this.drawPixelRect(ctx, x + 18, y - 32, w - 36, 8, roofColor);

    this.drawPixelRect(ctx, x + 12, y - 32, w - 24, 4, "#ffd7a0", 0.18);
    this.drawPixelRect(ctx, x + 6, y - 8, w - 12, 4, "#5c3520", 0.22);

    this.drawPixelRect(ctx, x + w - 14, y - 24, 6, 24, "#8b4c2b", 0.22);
  };

  const drawWindow = (x: number, y: number) => {
    this.drawPixelRect(ctx, x, y, 18, 18, "#8fd0ff");
    this.drawPixelRect(ctx, x + 8, y, 2, 18, "#d9f1ff");
    this.drawPixelRect(ctx, x, y + 8, 18, 2, "#d9f1ff");
    this.drawPixelRect(ctx, x, y + 14, 18, 4, "#65a8d8", 0.55);
  };

  for (const b of buildings) {
    const bodyY = baseY - b.h;

    this.drawProjectedShadow(ctx, width, b.x, b.x + b.w, baseY, b.h, 0.14, 1.45);

    // main body
    this.drawPixelRect(ctx, b.x, bodyY, b.w, b.h, b.body);

    // left dark face
    this.drawPixelRect(ctx, b.x, bodyY, 10, b.h, "#d2c3ab");

    // right soft light face
    this.drawPixelRect(ctx, b.x + b.w - 8, bodyY, 8, b.h, "#f8efdf", 0.55);

    // chunky top lip
    this.drawPixelRect(ctx, b.x, bodyY, b.w, 6, "#fff4df", 0.45);

    // heavy lower trim band
    this.drawPixelRect(ctx, b.x, bodyY + 20, b.w, 8, "#b8874f");

    // vertical beams
    this.drawPixelRect(ctx, b.x + 12, bodyY, 8, b.h, "#b8874f");
    this.drawPixelRect(ctx, b.x + b.w - 20, bodyY, 8, b.h, "#b8874f");

    // beam shadows
    this.drawPixelRect(ctx, b.x + 20, bodyY, 3, b.h, "#916539", 0.28);
    this.drawPixelRect(ctx, b.x + b.w - 12, bodyY, 3, b.h, "#916539", 0.22);

    // stepped roof instead of smooth triangle
    drawSteppedRoof(b.x, bodyY, b.w, b.roof);

    // door
    this.drawPixelRect(ctx, b.x + b.w / 2 - 10, baseY - 28, 20, 28, "#73451f");
    this.drawPixelRect(ctx, b.x + b.w / 2 - 6, baseY - 28, 4, 28, "#8c5930");
    this.drawPixelRect(ctx, b.x + b.w / 2 + 5, baseY - 14, 3, 3, "#ddb678");

    const leftWindowX = b.x + 12;
    const rightWindowX = b.x + b.w - 30;
    const firstWindowY = bodyY + 20;

    drawWindow(leftWindowX, firstWindowY);
    drawWindow(rightWindowX, firstWindowY);

    if (b.h > 120) {
      drawWindow(b.x + 14, firstWindowY + 34);
      drawWindow(b.x + b.w - 32, firstWindowY + 34);
    }

    // little pixel bushes
    this.drawPixelRect(ctx, b.x - 8, baseY - 14, 16, 14, "#3f8738");
    this.drawPixelRect(ctx, b.x - 4, baseY - 18, 8, 4, "#5db454");
    this.drawPixelRect(ctx, b.x + b.w - 8, baseY - 14, 16, 14, "#4cae4f");
    this.drawPixelRect(ctx, b.x + b.w - 4, baseY - 18, 8, 4, "#79ca70");
  }

  // tower
  this.drawProjectedShadow(ctx, width, 392, 420, baseY, 168, 0.15, 1.5);

  this.drawPixelRect(ctx, 392, baseY - 168, 28, 168, "#efe8d6");
  this.drawPixelRect(ctx, 392, baseY - 168, 6, 168, "#d8ccb2");
  this.drawPixelRect(ctx, 414, baseY - 168, 6, 168, "#fff4e3", 0.55);

  this.drawPixelRect(ctx, 386, baseY - 176, 40, 10, "#d2c5a8");
  this.drawPixelRect(ctx, 390, baseY - 180, 32, 4, "#f0e6cf", 0.45);

  this.drawPixelRect(ctx, 398, baseY - 192, 16, 16, "#4db7e5");
  this.drawPixelRect(ctx, 401, baseY - 189, 10, 10, "#d9f1ff");
  this.drawPixelRect(ctx, 404, baseY - 205, 4, 14, "#8a8f9c");

  // tiny base greenery so it feels rooted
  this.drawPixelRect(ctx, 384, baseY - 10, 14, 10, "#3f8738");
  this.drawPixelRect(ctx, 416, baseY - 10, 14, 10, "#5aae50");
}

private drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const horizonY = Math.floor(height * 0.73);
  const roadWidthAtHorizon = width * 0.34;
  const centerX = width / 2;

  // dirt base under everything
  this.drawPixelRect(ctx, 0, horizonY, width, height - horizonY, "#8b7355");

  let currentY = horizonY;
  let rowIndex = 0;
  let segmentH = 8;

  while (currentY < height) {
    const rowY = currentY;

    segmentH += 4;

    const roadWidth = roadWidthAtHorizon + rowIndex * 64;
    const roadLeft = centerX - roadWidth / 2;
    const roadRight = centerX + roadWidth / 2;

    // grass left
    this.drawPixelRect(
      ctx,
      0,
      rowY,
      roadLeft,
      segmentH,
      rowIndex % 2 === 0 ? "#4d9b47" : "#5dae56"
    );

    // grass right
    this.drawPixelRect(
      ctx,
      roadRight,
      rowY,
      width - roadRight,
      segmentH,
      rowIndex % 2 === 0 ? "#4d9b47" : "#5dae56"
    );

    // chunky grass texture
    for (let gx = 0; gx < roadLeft; gx += 28) {
      this.drawPixelRect(
        ctx,
        gx + (rowIndex % 2) * 8,
        rowY + 2,
        10,
        4,
        "#6ab85d"
      );
    }

    for (let gx = roadRight; gx < width; gx += 28) {
      this.drawPixelRect(
        ctx,
        gx + (rowIndex % 2) * 8,
        rowY + 2,
        10,
        4,
        "#6ab85d"
      );
    }

    // curb strips
    this.drawPixelRect(ctx, roadLeft, rowY, 8, segmentH, "#6f5a3d");
    this.drawPixelRect(ctx, roadRight - 8, rowY, 8, segmentH, "#6f5a3d");

    this.drawPixelRect(ctx, roadLeft + 2, rowY, 2, segmentH, "#9d845f");
    this.drawPixelRect(ctx, roadRight - 6, rowY, 2, segmentH, "#4e3d29");

    // cobble road
    const tileW = 48 + rowIndex * 4;
    const rowOffset = rowIndex % 2 === 0 ? 0 : tileW / 2;

    for (let x = roadLeft - tileW; x < roadRight + tileW; x += tileW) {
      const tx = x + rowOffset;
      const tileRight = tx + tileW - 4;

      if (tileRight <= roadLeft + 8 || tx >= roadRight - 8) continue;

      const clippedX = Math.max(tx, roadLeft + 8);
      const clippedRight = Math.min(tileRight, roadRight - 8);
      const drawW = clippedRight - clippedX;

      if (drawW <= 6) continue;

      const isDark = ((Math.floor(x / tileW) + rowIndex) & 1) === 0;
      const stoneColor = isDark ? "#b1936b" : "#c4a675";

      this.drawPixelRect(ctx, clippedX, rowY, drawW, segmentH - 4, stoneColor);
      this.drawPixelRect(ctx, clippedX, rowY, drawW, 4, "#dec5a0", 0.5);
      this.drawPixelRect(ctx, clippedX, rowY, 4, segmentH - 4, "#dec5a0", 0.25);

      this.drawPixelRect(
        ctx,
        clippedX,
        rowY + segmentH - 8,
        drawW,
        4,
        "#7a5e3f",
        0.5
      );

      this.drawPixelRect(
        ctx,
        clippedX + drawW - 4,
        rowY + 4,
        4,
        segmentH - 8,
        "#8a6a47",
        0.22
      );
    }

    currentY += segmentH;
    rowIndex++;
  }

  // horizon trim
  this.drawPixelRect(ctx, 0, horizonY - 8, width, 4, "#6ab85d");
  this.drawPixelRect(ctx, 0, horizonY - 4, width, 6, "#2e721d");
}

  private drawGrassBreeze(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const grassY = height * 0.73 - 10;
    const getWindOffset = (x: number) => Math.sin(this.time * 1.5 + x * 0.05) * 3;

    for (let i = -32; i < width + 32; i += 32) {
      const sway = getWindOffset(i);

      this.drawPixelRect(ctx, i + sway * 0.5, grassY + 8, 8, 10, "#3c8e3f");
      this.drawPixelRect(ctx, i + 8 + sway, grassY, 8, 18, "#54b857");
      this.drawPixelRect(ctx, i + 16 + sway * 0.7, grassY + 4, 8, 14, "#469e48");
      this.drawPixelRect(ctx, i + 24 + sway * 0.3, grassY + 8, 8, 10, "#3c8e3f");
    }

    for (let i = 60; i < width; i += 150) {
      const sway = getWindOffset(i) * 1.1;
      this.drawPixelRect(ctx, i + sway, grassY + 22, 4, 4, "#458523");
      this.drawPixelRect(ctx, i + 16 + sway, grassY + 16, 4, 4, "#705d27");
      this.drawPixelRect(ctx, i + 30 + sway, grassY + 22, 4, 4, "#8ce6ff");
    }
  }

  private drawFountain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const baseY = height * 0.82;
    const leafDrift = this.time * 42;

    const drawLeaf = (x: number, y: number, color: string) => {
      this.drawPixelRect(ctx, x, y, 6, 4, color);
      this.drawPixelRect(ctx, x + 2, y - 2, 2, 2, "#fff2a8", 0.5);
    };

    const drawTree = (
      x: number,
      trunkH: number,
      canopyW: number,
      canopyH: number,
      leafA: string,
      leafB: string,
      leafC: string,
      swayAmount: number
    ) => {
      const sway = Math.sin(this.time * 1.6 + x * 0.02) * swayAmount;

      this.drawGroundEllipseShadow(
        ctx,
        x + 6,
        baseY + 5,
        canopyW * 0.24,
        10,
        0.2
      );

      this.drawPixelRect(ctx, x - 8, baseY - trunkH, 16, trunkH, "#5b3b22");
      this.drawPixelRect(ctx, x - 4, baseY - trunkH, 4, trunkH, "#7a5230", 0.6);

      this.drawPixelRect(
        ctx,
        x - canopyW / 2 + sway,
        baseY - trunkH - 18,
        canopyW,
        30,
        leafB
      );

      this.drawPixelRect(
        ctx,
        x - canopyW / 2 + 12 + sway * 0.8,
        baseY - trunkH - canopyH * 0.45,
        canopyW - 24,
        26,
        leafC
      );

      this.drawPixelRect(
        ctx,
        x - canopyW / 2 + 22 + sway * 0.6,
        baseY - trunkH - canopyH + 32,
        canopyW - 44,
        22,
        leafA
      );

      this.drawPixelRect(
        ctx,
        x - canopyW / 2 - 8 + sway,
        baseY - trunkH - 8,
        24,
        18,
        leafA
      );

      this.drawPixelRect(
        ctx,
        x + canopyW / 2 - 16 + sway,
        baseY - trunkH - 10,
        24,
        18,
        leafC
      );
    };

    drawTree(120, 120, 120, 92, "#5aa84f", "#3f8738", "#6dbd62", 10);
    drawTree(260, 96, 92, 74, "#63ad58", "#468d40", "#78c96f", 7);

    this.drawPixelRect(ctx, 70, baseY - 10, 44, 14, "#3f8738");
    this.drawPixelRect(ctx, 98, baseY - 18, 36, 14, "#5aa84f");
    this.drawPixelRect(ctx, 226, baseY - 8, 40, 14, "#3f8738");
    this.drawPixelRect(ctx, 246, baseY - 16, 34, 14, "#5aa84f");

    const monsterBaseY = baseY - 146;
    const monsterHeight = 5;

this.drawMonsterStand(ctx, width - 100, monsterBaseY, "SPARKY", monsterHeight);
this.drawMonsterStand(ctx, width - 200, monsterBaseY, "SQUNCH", monsterHeight);
this.drawMonsterStand(ctx, width - 300, monsterBaseY, "HOWLLET", monsterHeight);
this.drawMonsterStand(ctx, width - 400, monsterBaseY, "ROPPER", monsterHeight);
this.drawMonsterStand(ctx, width - 500, monsterBaseY, "KANGASHOE", monsterHeight);
this.drawMonsterStand(ctx, width - 600, monsterBaseY, "WETKO", monsterHeight);
this.drawMonsterStand(ctx, width - 700, monsterBaseY, "CLUCK", monsterHeight);
this.drawMonsterStand(ctx, width - 800, monsterBaseY, "BUTTBUTT", monsterHeight);
this.drawMonsterStand(ctx, width - 900, monsterBaseY, "TREEUNGE", monsterHeight);
this.drawMonsterStand(ctx, width - 1000, monsterBaseY, "GINGER", monsterHeight);


    const leaves = [
      {
        x: 150 + (leafDrift * 0.7) % 140,
        y: baseY - 130 + Math.sin(this.time * 2.4) * 8,
        c: "#f2b84b",
      },
      {
        x: 118 + (leafDrift * 0.5) % 180,
        y: baseY - 104 + Math.sin(this.time * 2.1 + 1.2) * 10,
        c: "#e08a3a",
      },
      {
        x: 210 + (leafDrift * 0.6) % 120,
        y: baseY - 88 + Math.sin(this.time * 2.7 + 2.1) * 6,
        c: "#c86b32",
      },
      {
        x: 82 + (leafDrift * 0.45) % 210,
        y: baseY - 62 + Math.sin(this.time * 2.2 + 0.5) * 7,
        c: "#f0cf5a",
      },
    ];

    for (const leaf of leaves) {
      const wrapX = ((leaf.x - 40) % 320) + 40;
      drawLeaf(wrapX, leaf.y, leaf.c);
    }
  }

private drawMonsterStand(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  monsterId: "SQUNCH" | "KANGASHOE" | "SPARKY" | "ROPPER" | "WETKO" | "GINGER" | "HOWLLET" | "CLUCK" | "BUTTBUTT" | "TREEUNGE",
  targetHeight: number
) {
  const bob = Math.sin(this.time * 2 + x * 0.02) * 2;
  const def = monsterRegistry[monsterId];

  if (!def) return;

  // smaller soft shadow directly under monster
  this.drawGroundEllipseShadow(
    ctx,
    x,
    baseY + 10,
    targetHeight * 2,
    targetHeight * 0.06,
    0.22
  );

  drawMonster(def, {
    ctx,
    x,
    y: baseY + bob,
    time: this.time,
    mouseX: this.mouseX,
    mouseY: this.mouseY,
    state: "HOME",
  });
}

   private drawWoodBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  post = false
) {
  x = this.snap(x);
  y = this.snap(y);
  w = this.snap(w);
  h = this.snap(h);

  const outline = "#663c20";
  const shadow = "#4a2914";
  const dark = "#6a3c1c";
  const mid = "#8a5428";
  const light = "#b6783d";
  const highlight = "#d59a58";

  // outer chunky frame
  this.drawPixelRect(ctx, x - 8, y - 8, w + 16, h + 16, outline);

  // drop shadow chunk
  this.drawPixelRect(ctx, x + 4, y + h + 8, w, 8, shadow);
  this.drawPixelRect(ctx, x + w, y + 4, 8, h + 12, shadow);

  // main body
  this.drawPixelRect(ctx, x, y, w, h, dark);

  // inset face
  this.drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, mid);

  // stepped border highlights
  this.drawPixelRect(ctx, x + 4, y + 4, w - 8, 4, highlight);
  this.drawPixelRect(ctx, x + 4, y + 8, 4, h - 16, light);
  this.drawPixelRect(ctx, x + w - 8, y + 8, 4, h - 16, shadow);
  this.drawPixelRect(ctx, x + 4, y + h - 8, w - 8, 4, outline);

  // big simple plank bands
  for (let py = y + 12; py < y + h - 12; py += 16) {
    const plankColor = ((py - y) / 16) % 2 === 0 ? "#9a6030" : "#855026";
    this.drawPixelRect(ctx, x + 8, py, w - 16, 12, plankColor);
    this.drawPixelRect(ctx, x + 8, py, w - 16, 2, highlight);
    this.drawPixelRect(ctx, x + 8, py + 10, w - 16, 2, shadow);

    // short knot / seam chunks
    for (let gx = x + 18; gx < x + w - 24; gx += 36) {
      this.drawPixelRect(ctx, gx, py + 4, 8, 4, dark);
    }
  }

  // corner caps
  this.drawPixelRect(ctx, x + 4, y + 4, 8, 8, light);
  this.drawPixelRect(ctx, x + w - 12, y + 4, 8, 8, light);
  this.drawPixelRect(ctx, x + 4, y + h - 12, 8, 8, shadow);
  this.drawPixelRect(ctx, x + w - 12, y + h - 12, 8, 8, shadow);

  // chunky rivets
  const rivets = [
    { rx: x + 12, ry: y + 12 },
    { rx: x + w - 18, ry: y + 12 },
    { rx: x + 12, ry: y + h - 18 },
    { rx: x + w - 18, ry: y + h - 18 },
  ];

  rivets.forEach(({ rx, ry }) => {
    this.drawPixelRect(ctx, rx, ry, 6, 6, "#c9a35a");
    this.drawPixelRect(ctx, rx + 2, ry + 2, 2, 2, "#f7df9a");
  });

  if (post) {
    const postW = 20;
    const postXs = [x + 28, x + w - 48];

    postXs.forEach((pxPos) => {
      this.drawPixelRect(ctx, pxPos, y + h, postW, 40, outline);
      this.drawPixelRect(ctx, pxPos + 4, y + h, postW - 8, 40, dark);
      this.drawPixelRect(ctx, pxPos + 4, y + h, 4, 40, light);
      this.drawPixelRect(ctx, pxPos + postW - 8, y + h, 4, 40, shadow);
    });
  }
}

  private drawPixelText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    scale: number,
    color: string,
    shadowColor?: string,
    center = true,
    animate = false
  ) {
    const glyphs: Record<string, string[]> = {
      A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
      B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
      C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
      D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
      E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
      F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
      G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
      H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
      I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
      J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
      K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
      L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
      M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
      N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
      O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
      P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
      Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
      R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
      S: ["01111", "10000", "01110", "00001", "00001", "10001", "01110"],
      T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
      U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
      V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
      W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
      X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
      Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
      Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
      "0": ["01110", "10011", "10101", "11001", "10001", "10001", "01110"],
      "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
      ".": ["00000", "00000", "00000", "00000", "00000", "00000", "01100"],
      "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
      "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
      " ": ["000", "000", "000", "000", "000", "000", "000"],
    };

    const chars = text.toUpperCase().split("");
    const letterSpacing = 1 * scale;
    const charWidths = chars.map((ch) => (glyphs[ch]?.[0].length || 5) * scale);
    const totalWidth =
      charWidths.reduce((sum, w) => sum + w, 0) +
      (chars.length - 1) * letterSpacing;

    let cursorX = center ? x - totalWidth / 2 : x;

    const drawGlyph = (
      gx: number,
      gy: number,
      glyph: string[],
      fill: string,
      alpha: number = 1
    ) => {
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col] === "1") {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = fill;

            if (alpha === 1 && row > 3) {
              ctx.fillStyle = this.adjustColor(fill, -20);
            }

            this.drawPixelRect(
              ctx,
              gx + col * scale,
              gy + row * scale,
              scale,
              scale,
              ctx.fillStyle as string,
              alpha
            );
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    for (let i = 0; i < chars.length; i++) {
      const glyph = glyphs[chars[i]] || glyphs[" "];
      const waveY = animate ? Math.sin(this.time * 3.2 + i * 0.4) * (scale * 0.7) : 0;
      const charY = y + waveY;

      if (shadowColor) {
        const depthSteps = scale > 4 ? 3 : 1;
        for (let d = 1; d <= depthSteps; d++) {
          const shadowOffset = d * (scale / 3);
          drawGlyph(
            cursorX + shadowOffset,
            charY + shadowOffset,
            glyph,
            shadowColor,
            0.4 / d
          );
        }
      }

      drawGlyph(cursorX, charY, glyph, color);
      cursorX += glyph[0].length * scale + letterSpacing;
    }
  }

  private adjustColor(color: string, amount: number): string {
    return (
      "#" +
      color
        .replace(/^#/, "")
        .replace(/../g, (part) =>
          ("0" + Math.min(255, Math.max(0, parseInt(part, 16) + amount)).toString(16)).slice(
            -2
          )
        )
    );
  }

  private drawTitle(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const boardW = 760;
    const boardH = 118;
    const centerX = width / 2;

    const boardFloat = Math.sin(this.time * 0.55) * 6;
    const x = centerX - boardW / 2;
    const y = height * 0.18 + boardFloat;

    this.drawProjectedShadow(ctx, width, x + 30, x + boardW - 30, y + boardH, boardH, 0.16, 1.1);

    this.drawWoodBoard(ctx, x, y, boardW, boardH, false);

    this.drawPixelText(
      ctx,
      "KONJURE KINS",
      centerX,
      y + 28,
      8,
      "#ffe8a3",
      "#2a190d",
      true,
      true
    );

    if (Math.sin(this.time * 1.6) > 0.992) {
      const glintX = centerX + Math.sin(this.time * 4.5) * 180;
      this.drawPixelSparkle(ctx, glintX, y + 40, "#ffffff", 0);
    }
  }

   private drawButton(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const pressT = this.isTransitioning
      ? this.clamp(this.transitionTimer / 0.12, 0, 1)
      : 0;

    const hoverScale = this.isHoveringStart ? 1.08 : 1.0;
    const pressedScale = 1 - pressT * 0.08;
    const shakeX =
      this.isTransitioning
        ? Math.sin(this.time * 40) * (1 - pressT) * 6
        : this.isHoveringStart
        ? Math.sin(this.time * 18) * 2
        : 0;

    const buttonWidth = 340 * hoverScale * pressedScale;
    const buttonHeight = 104 * hoverScale * pressedScale;

    const centerX = width / 2;
    const centerY = height * 0.62;

    const x = centerX - buttonWidth / 2 + shakeX;
        const y = centerY - buttonHeight / 2 + pressT * 10;

    this.startButtonBounds = { x, y, width: buttonWidth, height: buttonHeight };

    if (this.isHoveringStart) {
      const auraAlpha = 0.22 + Math.sin(this.time * 8) * 0.08;
      this.drawPixelRect(
        ctx,
        x - 12,
        y - 12,
        buttonWidth + 24,
        buttonHeight + 24,
        "#fff1a6",
        auraAlpha
      );
      this.drawPixelRect(
        ctx,
        x - 6,
        y - 6,
        buttonWidth + 12,
        buttonHeight + 12,
        "#ffcc00",
        0.22
      );

      if (Math.floor(this.time * 10) % 2 === 0) {
        this.drawPixelSparkle(ctx, x, y, "#ffffff", 0);
        this.drawPixelSparkle(ctx, x + buttonWidth, y + buttonHeight, "#ffffff", 2);
      }
    }

    this.drawProjectedShadow(
      ctx,
      width,
      x + 24,
      x + buttonWidth - 24,
      y + buttonHeight + 40,
      buttonHeight + 40,
      0.17,
      1.0
    );

    this.drawWoodBoard(ctx, x, y, buttonWidth, buttonHeight, true);

    const textScale = this.isHoveringStart ? 8 : 7;
    const textColor = this.isHoveringStart ? "#ffffff" : "#fff4c2";
    const textY = y + buttonHeight / 2 - textScale * 3.5;

      this.drawPixelText(
      ctx,
      this.isTransitioning ? "LOADING" : "LOGIN",
      centerX + shakeX,
      textY,
      textScale,
      textColor,
      "#2b1c12",
      true,
      this.isHoveringStart || this.isTransitioning
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    let cameraX = 0;
    let cameraY = 0;

    if (this.isTransitioning) {
      const t = this.clamp(this.transitionTimer / this.transitionDuration, 0, 1);
      const shake = (1 - t) * 8;
      cameraX = Math.round(Math.sin(this.time * 52) * shake);
      cameraY = Math.round(Math.cos(this.time * 48) * shake * 0.6);
    }

    ctx.save();
    ctx.translate(cameraX, cameraY);

    this.drawSky(ctx, width, height);
    this.drawSun(ctx, width);
    this.drawClouds(ctx);
    this.drawMountains(ctx, width, height);
    this.drawTreeLine(ctx, width, height);
    this.drawCity(ctx, width, height);
    this.drawGrassBreeze(ctx, width, height);
    this.drawGround(ctx, width, height);
    this.drawFountain(ctx, width, height);

    this.drawTitle(ctx, width, height);
    this.drawButton(ctx, width, height);

    this.drawPixelText(
      ctx,
      "V0.1 BETA",
      width / 2,
      height - 28,
      3,
      "#ffffff",
      "#6b5a3a",
      true,
      false
    );

    ctx.restore();

    this.drawLoginTransition(ctx, width, height);
  }
}