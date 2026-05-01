import { StateManager } from "../systems/StateManager";
import { HomeHub } from "./HomeHub";

type Particle = {
  x: number;
  y: number;
  r: number;
  speedX: number;
  speedY: number;
  alpha: number;
};

export class LoginScreen {
  manager: StateManager;

  bgImage: HTMLImageElement;
  bgLoaded = false;

  titleImage: HTMLImageElement;
  titleLoaded = false;

  cloudImage: HTMLImageElement;
  cloudLoaded = false;

  startButtonImage: HTMLImageElement;
  startButtonLoaded = false;

  time = 0;
  particles: Particle[] = [];

  mouseX = 0;
  mouseY = 0;
  isHoveringStart = false;

  startButtonBounds = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  constructor(manager: StateManager) {
    this.manager = manager;

    this.bgImage = new Image();
    this.bgImage.src = "/games/alphamon/start-screen-bg.png";
    this.bgImage.onload = () => {
      this.bgLoaded = true;
    };

    this.titleImage = new Image();
    this.titleImage.src = "/games/alphamon/start-screen-title.png";
    this.titleImage.onload = () => {
      this.titleLoaded = true;
    };

    this.cloudImage = new Image();
    this.cloudImage.src = "/games/alphamon/start-screen-cloud.png";
    this.cloudImage.onload = () => {
      this.cloudLoaded = true;
    };

    this.startButtonImage = new Image();
    this.startButtonImage.src = "/games/alphamon/start-screen-start-button.png";
    this.startButtonImage.onload = () => {
      this.startButtonLoaded = true;
    };

    this.createParticles(28);

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
    if (!this.isHoveringStart) return;

    this.destroy();
    this.manager.setState(new HomeHub(this.manager));
  };

  update() {
    this.time += 0.016;

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x > 1280 + 20) p.x = -20;
      if (p.x < -20) p.x = 1280 + 20;

      if (p.y < -20) {
        p.y = 720 + Math.random() * 40;
        p.x = Math.random() * 1280;
      }
    }
  }

  private createParticles(count: number) {
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      r: Math.random() * 2.2 + 0.8,
      speedX: Math.random() * 0.18 - 0.09,
      speedY: -(Math.random() * 0.18 + 0.04),
      alpha: Math.random() * 0.35 + 0.08,
    }));
  }

  private drawCoverImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const dx = (canvasWidth - drawWidth) / 2;
    const dy = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  }

  private drawCenteredImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    alpha = 1
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, centerX - width / 2, centerY - height / 2, width, height);
    ctx.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    if (this.bgLoaded) {
      this.drawCoverImage(ctx, this.bgImage, width, height);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, width, height);

    const titleFloatY = Math.sin(this.time * 0.9) * 2;
    const titleFloatX = Math.sin(this.time * 0.5) * 1.5;

    const titleMaxWidth = width * 0.62;
    let titleDrawWidth = 0;
    let titleDrawHeight = 0;
    const titleCenterX = width / 2 + titleFloatX;
    const titleCenterY = 300 + titleFloatY;

    if (this.titleLoaded) {
      const titleScale = titleMaxWidth / this.titleImage.width;
      titleDrawWidth = this.titleImage.width * titleScale;
      titleDrawHeight = this.titleImage.height * titleScale;

    

      this.drawCenteredImage(
        ctx,
        this.titleImage,
        titleCenterX,
        titleCenterY,
        titleDrawWidth,
        titleDrawHeight
      );
    }

    if (this.cloudLoaded && titleDrawWidth > 0 && titleDrawHeight > 0) {
  const cloudBaseWidth = width * 0.78;
  const cloudScale = cloudBaseWidth / this.cloudImage.width;
  const cloudW = this.cloudImage.width * cloudScale;
  const cloudH = this.cloudImage.height * cloudScale;

  const drift = Math.sin(this.time * 0.22) * 55;

  const leftCloudX = width / 2 - titleDrawWidth * 0.8 - 120 - drift;
  const rightCloudX = width / 2 + titleDrawWidth * 0.8 + 120 + drift;

  const leftCloudY =
    titleCenterY - titleDrawHeight * 0.48 + Math.cos(this.time * 0.35) * 2;

  const rightCloudY =
    titleCenterY - titleDrawHeight * 0.48 + Math.cos(this.time * 0.32) * 2;

  // LEFT CLOUD (flipped)
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.translate(leftCloudX, leftCloudY);
  ctx.scale(-1, 1);
  ctx.drawImage(this.cloudImage, -cloudW / 2, -cloudH / 2, cloudW, cloudH);
  ctx.restore();

  // RIGHT CLOUD
  this.drawCenteredImage(
    ctx,
    this.cloudImage,
    rightCloudX,
    rightCloudY,
    cloudW,
    cloudH,
    0.88
  );
}

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(
        p.x + Math.sin(this.time + p.y * 0.01) * 0.8,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    if (this.startButtonLoaded) {
      const hoverScale = this.isHoveringStart ? 1.06 : 1;
      const floatY = this.isHoveringStart
        ? Math.sin(this.time * 3.2) * 2
        : Math.sin(this.time * 2.1) * 1;

      const buttonBaseWidth = width * 0.27;
      const buttonScale = buttonBaseWidth / this.startButtonImage.width;

      const buttonWidth = this.startButtonImage.width * buttonScale * hoverScale;
      const buttonHeight = this.startButtonImage.height * buttonScale * hoverScale;

      const buttonX = width / 2 - buttonWidth / 2;
      const buttonY = height - 400 + floatY;

      this.startButtonBounds = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
      };
// ==================================================
// VERSION / STUDIO WATERMARK
// ==================================================
ctx.save();

ctx.font = "15px monospace";
ctx.textAlign = "center";
ctx.textBaseline = "bottom";

ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
ctx.shadowColor = "rgba(0,0,0,0.6)";
ctx.shadowBlur = 6;
ctx.fillText(
  "KamiKarp Studios Original • v0.1 Beta",
  width / 5,
  height - 12
);

ctx.restore();
      if (this.isHoveringStart) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.filter = "blur(1px)";
        ctx.drawImage(
          this.startButtonImage,
          buttonX,
          buttonY + 4,
          buttonWidth,
          buttonHeight
        );
        ctx.restore();
      }

      ctx.drawImage(
        this.startButtonImage,
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight
      );
    }
  }
}