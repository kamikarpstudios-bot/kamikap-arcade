import { StateManager } from "../systems/StateManager";
import { DevTestScreen } from "./DevTestScreen";
import { CampaignScreen } from "./CampaignScreen";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { drawMonster } from "../Monsters/drawMonster";
import { SummonHallScreen } from "./SummonHallScreen";
import { KonjureScreen } from "./KonjureScreen";

type HubButton = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
  floatOffset: number;
  floatSeed: number;
  hoverAnim: number;
};

type Cloud = {
  x: number;
  y: number;
  size: number;
  speed: number;
};

type TopMenuButton = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
  floatOffset: number;
  floatSeed: number;
};

type AmbientParticle = {
  x: number;
  y: number;
  r: number;
  speedX: number;
  speedY: number;
  alpha: number;
  sway: number;
};

type SimpleUiButton = {
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

type MonsterOptionButton = {
  monsterId: keyof typeof monsterRegistry;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

export class HomeHub {
  manager: StateManager;

  mouseX = 0;
  mouseY = 0;

  time = 0;
  introActive = true;
  introTimer = 0;
  introDuration = 1.4;

  isSummonTransitioning = false;
  summonTransitionTimer = 0;
  summonTransitionDuration = 0.48;
  summonTransitionX = 0;
  summonTransitionY = 0;

  isCampaignTransitioning = false;
  campaignTransitionTimer = 0;
  campaignTransitionDuration = 0.42;
  campaignTransitionX = 0;
  campaignTransitionY = 0;

  isKonjureTransitioning = false;
  konjureTransitionTimer = 0;
  konjureTransitionDuration = 0.48;
  konjureTransitionX = 0;
  konjureTransitionY = 0;

  clouds: Cloud[] = [];
  
  monsterArea = {
    x: 90,
    y: 120,
    width: 430,
    height: 360,
  };

  changeMonsterButton: SimpleUiButton = {
    x: 0,
    y: 0,
    width: 180,
    height: 44,
    hovered: false,
  };

  devTestButton: SimpleUiButton = {
    x: 0,
    y: 0,
    width: 150,
    height: 40,
    hovered: false,
  };

  monsterPickerBounds = {
    x: 0,
    y: 0,
    width: 360,
    height: 430,
  };

  monsterListViewport = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  monsterListScrollY = 0;
  monsterListContentHeight = 0;
  monsterOptionGap = 58;
  monsterOptionHeight = 48;

  monsterOptionButtons: MonsterOptionButton[] = [];

  closePickerButton: SimpleUiButton = {
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    hovered: false,
  };

  isMonsterPickerOpen = false;

  selectedMonsterId: keyof typeof monsterRegistry | null = null;

  buttons: HubButton[] = [];
  topButtons: TopMenuButton[] = [];
  particles: AmbientParticle[] = [];

  private createMonsterOptionButtons() {
    this.monsterOptionButtons = Object.entries(monsterRegistry).map(
      ([monsterId, monster]) => ({
        monsterId: monsterId as keyof typeof monsterRegistry,
        label: monster.name,
        x: 0,
        y: 0,
        width: 220,
        height: this.monsterOptionHeight,
        hovered: false,
      })
    );
  }

  constructor(manager: StateManager) {
    this.manager = manager;

    this.clouds = [
  { x: 90, y: 70, size: 0.9, speed: 0.08 },
  { x: 280, y: 120, size: 1.15, speed: 0.05 },
  { x: 520, y: 85, size: 0.8, speed: 0.07 },
  { x: 760, y: 135, size: 1.25, speed: 0.04 },
];

    this.createButtons();
    this.createTopButtons();
    this.createParticles(90);
    this.createMonsterOptionButtons();

    if (!this.selectedMonsterId && this.monsterOptionButtons.length > 0) {
      this.selectedMonsterId = this.monsterOptionButtons[0].monsterId;
    }

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("wheel", this.handleWheel);
  }

  private createButtons() {
 const labels = [
  "Campaign",
  "Konjure",
  "Online",
  "Inventory",
  "Guild",
  "Shop",
  "Encyclopedia",
  "Summons",
];

  this.buttons = labels.map((label, index) => ({
  label,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  hovered: false,
  floatOffset: 0,
  floatSeed: index * 0.8 + Math.random() * 0.6,
  hoverAnim: 0,
}));
  }

  private createTopButtons() {
    const labels = ["Mail", "Prestige", "Daily"];

    this.topButtons = labels.map((label, index) => ({
      label,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      hovered: false,
      floatOffset: 0,
      floatSeed: index * 1.1 + Math.random() * 0.5,
    }));
  }

  private createParticles(count: number) {
    this.particles = Array.from({ length: count }, () => ({
      x: 80 + Math.random() * 820,
      y: 80 + Math.random() * 540,
      r: Math.random() * 2 + 0.6,
      speedX: Math.random() * 0.06 - 0.03,
      speedY: -(Math.random() * 0.05 + 0.01),
      alpha: Math.random() * 0.22 + 0.06,
      sway: Math.random() * Math.PI * 2,
    }));
  }

  private isPointInButton(button: SimpleUiButton | MonsterOptionButton) {
    return (
      this.mouseX >= button.x &&
      this.mouseX <= button.x + button.width &&
      this.mouseY >= button.y &&
      this.mouseY <= button.y + button.height
    );
  }

  private isButtonVisibleInMonsterList(button: MonsterOptionButton) {
    return (
      button.y + button.height >= this.monsterListViewport.y &&
      button.y <= this.monsterListViewport.y + this.monsterListViewport.height
    );
  }

  private updateMonsterUiLayout() {
    this.changeMonsterButton.x = 170;
    this.changeMonsterButton.y = 650;

    this.devTestButton.x = 380;
    this.devTestButton.y = 650;

    this.monsterPickerBounds.x = 150;
    this.monsterPickerBounds.y = 110;
    this.monsterPickerBounds.width = 360;
    this.monsterPickerBounds.height = 430;

    const headerHeight = 82;
    const footerHeight = 70;
    const listPaddingX = 20;
    const listTopGap = 10;

    this.monsterListViewport.x = this.monsterPickerBounds.x + listPaddingX;
    this.monsterListViewport.y =
      this.monsterPickerBounds.y + headerHeight + listTopGap;
    this.monsterListViewport.width =
      this.monsterPickerBounds.width - listPaddingX * 2;
    this.monsterListViewport.height =
      this.monsterPickerBounds.height - headerHeight - footerHeight - listTopGap;

    this.monsterListContentHeight =
      this.monsterOptionButtons.length * this.monsterOptionGap;

    const maxScroll = Math.max(
      0,
      this.monsterListContentHeight - this.monsterListViewport.height
    );

    if (this.monsterListScrollY < 0) this.monsterListScrollY = 0;
    if (this.monsterListScrollY > maxScroll) this.monsterListScrollY = maxScroll;

    const contentStartY = this.monsterListViewport.y - this.monsterListScrollY;

    this.monsterOptionButtons.forEach((button, index) => {
      button.width = 220;
      button.height = this.monsterOptionHeight;

      button.x =
        this.monsterListViewport.x +
        this.monsterListViewport.width / 2 -
        button.width / 2;

      button.y = contentStartY + index * this.monsterOptionGap;
    });

    this.closePickerButton.x =
      this.monsterPickerBounds.x +
      this.monsterPickerBounds.width / 2 -
      this.closePickerButton.width / 2;

    this.closePickerButton.y =
      this.monsterPickerBounds.y + this.monsterPickerBounds.height - 52;
  }

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.updateMonsterUiLayout();

    for (const button of this.buttons) {
      button.hovered =
        this.mouseX >= button.x &&
        this.mouseX <= button.x + button.width &&
        this.mouseY >= button.y &&
        this.mouseY <= button.y + button.height;
    }

    for (const button of this.topButtons) {
      button.hovered =
        this.mouseX >= button.x &&
        this.mouseX <= button.x + button.width &&
        this.mouseY >= button.y &&
        this.mouseY <= button.y + button.height;
    }

    this.changeMonsterButton.hovered = this.isPointInButton(
      this.changeMonsterButton
    );
    this.devTestButton.hovered = this.isPointInButton(this.devTestButton);

    this.monsterOptionButtons.forEach((button) => {
      button.hovered =
        this.isMonsterPickerOpen &&
        this.isButtonVisibleInMonsterList(button) &&
        this.isPointInButton(button);
    });

    this.closePickerButton.hovered =
      this.isMonsterPickerOpen && this.isPointInButton(this.closePickerButton);
  };

  handleWheel = (event: WheelEvent) => {
    if (!this.isMonsterPickerOpen) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    const insideViewport =
      mouseX >= this.monsterListViewport.x &&
      mouseX <= this.monsterListViewport.x + this.monsterListViewport.width &&
      mouseY >= this.monsterListViewport.y &&
      mouseY <= this.monsterListViewport.y + this.monsterListViewport.height;

    if (!insideViewport) return;

    event.preventDefault();

    const maxScroll = Math.max(
      0,
      this.monsterListContentHeight - this.monsterListViewport.height
    );

    this.monsterListScrollY += event.deltaY * 0.8;

    if (this.monsterListScrollY < 0) this.monsterListScrollY = 0;
    if (this.monsterListScrollY > maxScroll) this.monsterListScrollY = maxScroll;

    this.updateMonsterUiLayout();

    this.monsterOptionButtons.forEach((button) => {
      button.hovered =
        this.isMonsterPickerOpen &&
        this.isButtonVisibleInMonsterList(button) &&
        this.isPointInButton(button);
    });
  };

  private startSummonTransition(centerX: number, centerY: number) {
  if (this.isSummonTransitioning) return;

  this.isSummonTransitioning = true;
  this.summonTransitionTimer = 0;
  this.summonTransitionX = centerX;
  this.summonTransitionY = centerY;
}
private startCampaignTransition(centerX: number, centerY: number) {
  if (this.isCampaignTransitioning) return;

  this.isCampaignTransitioning = true;
  this.campaignTransitionTimer = 0;
  this.campaignTransitionX = centerX;
  this.campaignTransitionY = centerY;
}
private startKonjureTransition(centerX: number, centerY: number) {
  this.isKonjureTransitioning = true;
  this.konjureTransitionTimer = 0;
  this.konjureTransitionX = centerX;
  this.konjureTransitionY = centerY;
}

  handleClick = () => {
   if (
  this.introActive ||
  this.isSummonTransitioning ||
  this.isCampaignTransitioning
) {
  return;
}

    if (this.isMonsterPickerOpen) {
      const clickedMonster = this.monsterOptionButtons.find(
        (button) => button.hovered
      );

      if (clickedMonster) {
        this.selectedMonsterId = clickedMonster.monsterId;
        this.isMonsterPickerOpen = false;
        return;
      }

      if (this.closePickerButton.hovered) {
        this.isMonsterPickerOpen = false;
        return;
      }

      return;
    }

    if (this.changeMonsterButton.hovered) {
      this.isMonsterPickerOpen = true;
      return;
    }

    if (this.devTestButton.hovered) {
      this.destroy();
      this.manager.setState(new DevTestScreen(this.manager));
      return;
    }

    const clickedTop = this.topButtons.find((button) => button.hovered);
    if (clickedTop) {
      console.log(clickedTop.label + " clicked");
      return;
    }

    const clicked = this.buttons.find((button) => button.hovered);
    if (!clicked) return;

    console.log(clicked.label + " clicked");

      switch (clicked.label) {
   case "Campaign":
    this.startCampaignTransition(
    clicked.x + clicked.width / 2,
    clicked.y + clicked.height / 2
  );
  break;
      case "Konjure":
    this.startKonjureTransition(
    clicked.x + clicked.width / 2,
    clicked.y + clicked.height / 2
  );
        break;
      case "Online":
        break;
      case "Inventory":
        break;
      case "Guild":
        break;
      case "Shop":
        break;
      case "Encyclopedia":
        break;
    case "Summons":
  this.startSummonTransition(
    clicked.x + clicked.width / 2,
    clicked.y + clicked.height / 2
  );
  break;
    }
  };

  update() {


    if (this.isSummonTransitioning) {
  this.summonTransitionTimer += 0.016;

  if (this.summonTransitionTimer >= this.summonTransitionDuration) {
    this.destroy?.();
    this.manager.setState(new SummonHallScreen(this.manager));
    return;
  }
}
if (this.isCampaignTransitioning) {
  this.campaignTransitionTimer += 0.016;

  if (this.campaignTransitionTimer >= this.campaignTransitionDuration) {
    this.destroy?.();
    this.manager.setState(
      new CampaignScreen(this.manager, {
        introStripeX: this.campaignTransitionX,
      })
    );
    return;
  }
}
if (this.isKonjureTransitioning) {
  this.konjureTransitionTimer += 0.016;

  if (this.konjureTransitionTimer >= this.konjureTransitionDuration) {
    this.destroy?.();
    this.manager.setState(
      new KonjureScreen(this.manager)
    );
    return;
  }
}

    this.time += 0.016;

    if (this.introActive) {
      this.introTimer += 0.016;
      if (this.introTimer >= this.introDuration) {
        this.introTimer = this.introDuration;
        this.introActive = false;
      }
    }

    this.updateMonsterUiLayout();
    
    for (const cloud of this.clouds) {
  cloud.x += cloud.speed;

  const cloudWidth = 15 * 10 * cloud.size; // shape width * px * scale
  if (cloud.x > 1000 + cloudWidth) {
    cloud.x = -cloudWidth - Math.random() * 120;
  }
}

    for (const button of this.buttons) {
  button.floatOffset = Math.sin(this.time * 1.2 + button.floatSeed) * 2;

  const target = button.hovered ? 1 : 0;
  button.hoverAnim += (target - button.hoverAnim) * 0.18;
}

    for (const button of this.topButtons) {
      button.floatOffset = Math.sin(this.time * 1.1 + button.floatSeed) * 2;
    }

    for (const p of this.particles) {
      p.x += p.speedX + Math.sin(this.time * 0.6 + p.sway) * 0.03;
      p.y += p.speedY;

      if (p.y < 40) {
        p.y = 650 + Math.random() * 40;
        p.x = 80 + Math.random() * 820;
      }

      if (p.x < 40) p.x = 40;
      if (p.x > 980) p.x = 980;
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

  private easeOutBack(t: number) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

private drawPixelButtonText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  hovered: boolean
) {
  const baseColor = hovered ? "#fff4c9" : "#f1ddb0";
  const shadowColor = "#4a2c14";
  const highlightColor = hovered ? "#fff8df" : "#f6e7c2";

  const scale = 2;
  const spacing = 1;

  this.drawCenteredBitmapText(
    ctx,
    text.toUpperCase(),
    Math.round(cx) + 2,
    Math.round(cy) + 2,
    shadowColor,
    scale,
    spacing
  );

  this.drawCenteredBitmapText(
    ctx,
    text.toUpperCase(),
    Math.round(cx),
    Math.round(cy),
    baseColor,
    scale,
    spacing
  );

  if (hovered) {
    this.drawCenteredBitmapText(
      ctx,
      text.toUpperCase(),
      Math.round(cx),
      Math.round(cy) - 1,
      highlightColor,
      scale,
      spacing
    );
  }
}

private drawKonjureTransitionOverlay(ctx: CanvasRenderingContext2D) {
  if (!this.isKonjureTransitioning) return;
  
  const t = Math.min(1, this.konjureTransitionTimer / this.konjureTransitionDuration);
  const ease = t < 0.5 ? 16 * t**5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
  
  // Background fade (for example, a mystical hue)
  this.drawPixelRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, "#442266", 0.2 + ease * 0.6);

  // Magical arc or swirl sweeping across
  const arcRadius = ease * (ctx.canvas.width + 100);
  const arcAlpha = 1 - t;
  this.drawPixelRect(ctx, ctx.canvas.width / 2 - arcRadius / 2, ctx.canvas.height / 2, arcRadius, 10, "#aa88ff", arcAlpha);

  // Optional: A brief flash at the peak of transition
  if (t > 0.8) {
    const flashSize = (t - 0.8) / 0.2 * ctx.canvas.width;
    this.drawPixelRect(ctx, ctx.canvas.width / 2 - flashSize / 2, ctx.canvas.height / 2 - flashSize / 2, flashSize, flashSize, "#ffffff", (t - 0.8) / 0.2);
  }
}

private drawSummonTransitionOverlay(ctx: CanvasRenderingContext2D) {
  if (!this.isSummonTransitioning) return;

  const t = Math.min(1, this.summonTransitionTimer / this.summonTransitionDuration);
  // Ease-In-Out Quint for a more "snappy" acceleration
  const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  const flash = t < 0.7 ? 0 : (t - 0.7) / 0.3;

  const cx = this.summonTransitionX;
  const cy = this.summonTransitionY;

  // 1. ATMOSPHERIC DIMMING
  // Let's add a "vignette" effect by making the center slightly clearer than the edges
  this.drawPixelRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, "#08121e", 0.1 + ease * 0.5);

  // 2. THE RITUAL CIRCLE (Dithered & Rotating)
  const ringSize = 40 + ease * 260;
  const rotation = this.time * 5;

  // Draw two intersecting "energy plates"
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2) + rotation;
    const rx = cx + Math.cos(angle) * (ringSize * 0.4);
    const ry = cy + 28 + Math.sin(angle) * 8;
    
    // Glowing corner brackets
    this.drawPixelRect(ctx, rx - 10, ry, 20, 4, "#5edbff", 0.8 * (1 - t));
    this.drawPixelRect(ctx, rx, ry - 10, 4, 20, "#5edbff", 0.8 * (1 - t));
  }

  // 3. THE "CYBER" BEAM
  // We'll stack multiple layers with different widths to create a glow core
  const beamH = ease * (ctx.canvas.height + 100);
  const beamW = 30 + Math.sin(this.time * 20) * 5; // Jittering width

  // Outer blue glow
  this.drawPixelRect(ctx, cx - beamW/2, cy - beamH + 20, beamW, beamH, "#5edbff", 0.2);
  // White core
  this.drawPixelRect(ctx, cx - beamW/6, cy - beamH + 20, beamW/3, beamH, "#ffffff", 0.6);

  // 4. DATA PARTICLES (Upward Velocity)
  // Instead of static sparks, these move UP the beam
  for (let i = 0; i < 8; i++) {
    const pT = (t + i * 0.15) % 1; // Loop particles
    const px = cx + Math.sin(i * 999) * (beamW * 0.4);
    const py = cy - (pT * ctx.canvas.height);
    const pSize = 2 + Math.random() * 4;

    this.drawPixelRect(ctx, px, py, pSize, pSize * 2, "#dcfaff", 1 - pT);
  }

  // 5. CHROMATIC FLOOR RINGS
  // To simulate "optical distortion," draw a red and blue ring slightly offset
  const distortedW = ringSize + Math.sin(this.time * 30) * 4;
  this.drawPixelRect(ctx, cx - distortedW/2 - 4, cy + 30, distortedW, 2, "#ff4d4d", 0.3); // Red shift
  this.drawPixelRect(ctx, cx - distortedW/2 + 4, cy + 30, distortedW, 2, "#5edbff", 0.3); // Blue shift
  this.drawPixelRect(ctx, cx - distortedW/2, cy + 30, distortedW, 4, "#ffffff", 0.8);      // White center

  // 6. SCREEN SHAKE
  // If the transition is intense (near the end), jitter the whole beam
  if (t > 0.5 && t < 0.9) {
    const shake = (Math.random() - 0.5) * 10;
    this.drawPixelRect(ctx, cx + shake - 2, 0, 4, ctx.canvas.height, "#ffffff", 0.15);
  }

  // 7. FINAL IMPACT FLASH
  if (flash > 0) {
    // A more interesting "radial" flash
    const flashSize = flash * ctx.canvas.width * 1.5;
    this.drawPixelRect(
        ctx, 
        cx - flashSize/2, 
        cy - flashSize/2, 
        flashSize, 
        flashSize, 
        "#ffffff", 
        flash
    );
  }
}

private drawCampaignTransitionOverlay(ctx: CanvasRenderingContext2D) {
  if (!this.isCampaignTransitioning) return;

  const t = Math.min(1, this.campaignTransitionTimer / this.campaignTransitionDuration);
  // Using a "Back" ease to make the bars overshoot slightly for a "snap" feel
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const flash = t < 0.8 ? 0 : (t - 0.8) / 0.2;

  const cx = this.campaignTransitionX;
  const cy = this.campaignTransitionY;

  // 1. SEPIA VIGNETTE
  // Warmer, parchment-like fade instead of dark blue
  this.drawPixelRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, "#2d1b0e", 0.1 + ease * 0.5);

  // 2. THE UNFURLING BANNERS (Horizontal "Gates")
  // Instead of simple bars, let's create two thick "curtains" that meet in the middle
  const bannerHeight = 60 * ease;
  const bannerWidth = ctx.canvas.width;

  // Top Banner (coming down)
  this.drawPixelRect(ctx, 0, 0, bannerWidth, bannerHeight, "#8d5e31"); // Fabric
  this.drawPixelRect(ctx, 0, bannerHeight - 4, bannerWidth, 4, "#d3a15b"); // Gold Trim
  
  // Bottom Banner (coming up)
  this.drawPixelRect(ctx, 0, ctx.canvas.height - bannerHeight, bannerWidth, bannerHeight, "#8d5e31");
  this.drawPixelRect(ctx, 0, ctx.canvas.height - bannerHeight, bannerWidth, 4, "#d3a15b");

  // 3. THE CENTRAL EMBLEM (The Flag Moment)
  // A vertical "Stripe" that expands and waves like a flag
  const stripeW = 120 * ease;
  const wave = Math.sin(this.time * 10) * 10; // "Flutter" effect

  // Draw the main "Flag" body in the center
  this.drawPixelRect(ctx, cx - stripeW / 2 + wave, 0, stripeW, ctx.canvas.height, "#b13e31", 0.7); // War Red
  
  // Add a Gold Crest line in the center
  this.drawPixelRect(ctx, cx - 4 + wave, 0, 8, ctx.canvas.height, "#f0d39a", 0.8);

  // 4. EMBERS OF WAR (Drifting Sparks)
  // Particles that drift sideways as if blown by a wind across the battlefield
  for (let i = 0; i < 12; i++) {
    const pT = (t + i * 0.2) % 1;
    const driftX = cx + (i * 40) - 240 + (pT * 400); // Moving left to right
    const driftY = cy + Math.sin(this.time + i) * 100;
    
    this.drawPixelRect(ctx, driftX, driftY, 4, 4, "#ffcc66", (1 - pT) * 0.8);
    // Add a trailing "tail" to sparks
    this.drawPixelRect(ctx, driftX - 6, driftY + 1, 6, 2, "#ff6600", (1 - pT) * 0.4);
  }

  // 5. THE "BATTLE HERALD" FLASH
  if (flash > 0) {
    // White flash with a slight gold tint
    this.drawPixelRect(
      ctx,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
      "#fff8e7",
      flash
    );
    
    // Impact "X" mark at the moment of transition
    const xSize = flash * 400;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    this.drawPixelRect(ctx, -xSize/2, -10, xSize, 20, "#ffffff", flash);
    this.drawPixelRect(ctx, -10, -xSize/2, 20, xSize, "#ffffff", flash);
    ctx.restore();
  }
}
private getBitmapGlyph(char: string): string[] {
  const glyphs: Record<string, string[]> = {
    A: [
      ".XXX.",
      "X...X",
      "X...X",
      "XXXXX",
      "X...X",
      "X...X",
      "X...X",
    ],
    B: [
      "XXXX.",
      "X...X",
      "X...X",
      "XXXX.",
      "X...X",
      "X...X",
      "XXXX.",
    ],
    C: [
      ".XXXX",
      "X....",
      "X....",
      "X....",
      "X....",
      "X....",
      ".XXXX",
    ],
    D: [
      "XXXX.",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "XXXX.",
    ],
    E: [
      "XXXXX",
      "X....",
      "X....",
      "XXXX.",
      "X....",
      "X....",
      "XXXXX",
    ],
    F: [
      "XXXXX",
      "X....",
      "X....",
      "XXXX.",
      "X....",
      "X....",
      "X....",
    ],
    G: [
      ".XXXX",
      "X....",
      "X....",
      "X.XXX",
      "X...X",
      "X...X",
      ".XXX.",
    ],
    H: [
      "X...X",
      "X...X",
      "X...X",
      "XXXXX",
      "X...X",
      "X...X",
      "X...X",
    ],
    I: [
      "XXXXX",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      "XXXXX",
    ],
    J: [
      "..XXX",
      "...X.",
      "...X.",
      "...X.",
      "...X.",
      "X..X.",
      ".XX..",
    ],
    K: [
      "X...X",
      "X..X.",
      "X.X..",
      "XX...",
      "X.X..",
      "X..X.",
      "X...X",
    ],
    L: [
      "X....",
      "X....",
      "X....",
      "X....",
      "X....",
      "X....",
      "XXXXX",
    ],
    M: [
      "X...X",
      "XX.XX",
      "X.X.X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
    ],
    N: [
      "X...X",
      "XX..X",
      "XX..X",
      "X.X.X",
      "X..XX",
      "X..XX",
      "X...X",
    ],
    O: [
      ".XXX.",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      ".XXX.",
    ],
    P: [
      "XXXX.",
      "X...X",
      "X...X",
      "XXXX.",
      "X....",
      "X....",
      "X....",
    ],
    Q: [
      ".XXX.",
      "X...X",
      "X...X",
      "X...X",
      "X.X.X",
      "X..X.",
      ".XX.X",
    ],
    R: [
      "XXXX.",
      "X...X",
      "X...X",
      "XXXX.",
      "X.X..",
      "X..X.",
      "X...X",
    ],
    S: [
      ".XXXX",
      "X....",
      "X....",
      ".XXX.",
      "....X",
      "....X",
      "XXXX.",
    ],
    T: [
      "XXXXX",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
    ],
    U: [
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      ".XXX.",
    ],
    V: [
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      "X...X",
      ".X.X.",
      "..X..",
    ],
    W: [
      "X...X",
      "X...X",
      "X...X",
      "X.X.X",
      "X.X.X",
      "XX.XX",
      "X...X",
    ],
    X: [
      "X...X",
      "X...X",
      ".X.X.",
      "..X..",
      ".X.X.",
      "X...X",
      "X...X",
    ],
    Y: [
      "X...X",
      "X...X",
      ".X.X.",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
    ],
    Z: [
      "XXXXX",
      "....X",
      "...X.",
      "..X..",
      ".X...",
      "X....",
      "XXXXX",
    ],
    "0": [
      ".XXX.",
      "X...X",
      "X..XX",
      "X.X.X",
      "XX..X",
      "X...X",
      ".XXX.",
    ],
    "1": [
      "..X..",
      ".XX..",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      ".XXX.",
    ],
    "2": [
      ".XXX.",
      "X...X",
      "....X",
      "...X.",
      "..X..",
      ".X...",
      "XXXXX",
    ],
    "3": [
      "XXXX.",
      "....X",
      "....X",
      ".XXX.",
      "....X",
      "....X",
      "XXXX.",
    ],
    "4": [
      "...X.",
      "..XX.",
      ".X.X.",
      "X..X.",
      "XXXXX",
      "...X.",
      "...X.",
    ],
    "5": [
      "XXXXX",
      "X....",
      "X....",
      "XXXX.",
      "....X",
      "....X",
      "XXXX.",
    ],
    "6": [
      ".XXX.",
      "X....",
      "X....",
      "XXXX.",
      "X...X",
      "X...X",
      ".XXX.",
    ],
    "7": [
      "XXXXX",
      "....X",
      "...X.",
      "..X..",
      ".X...",
      ".X...",
      ".X...",
    ],
    "8": [
      ".XXX.",
      "X...X",
      "X...X",
      ".XXX.",
      "X...X",
      "X...X",
      ".XXX.",
    ],
    "9": [
      ".XXX.",
      "X...X",
      "X...X",
      ".XXXX",
      "....X",
      "....X",
      ".XXX.",
    ],
    "!": [
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      "..X..",
      ".....",
      "..X..",
    ],
    "?": [
      ".XXX.",
      "X...X",
      "....X",
      "...X.",
      "..X..",
      ".....",
      "..X..",
    ],
    "-": [
      ".....",
      ".....",
      ".....",
      ".XXX.",
      ".....",
      ".....",
      ".....",
    ],
    " ": [
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
    ],
  };

  return glyphs[char] ?? glyphs["?"];
}

private measureBitmapText(text: string, scale = 2, spacing = 1) {
  const upper = text.toUpperCase();
  let width = 0;
  let height = 0;

  for (let i = 0; i < upper.length; i++) {
    const glyph = this.getBitmapGlyph(upper[i]);
    const glyphW = glyph[0].length * scale;
    const glyphH = glyph.length * scale;
    width += glyphW;
    if (i < upper.length - 1) width += spacing * scale;
    height = Math.max(height, glyphH);
  }

  return { width, height };
}

private drawBitmapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = "#f7edd1",
  scale = 2,
  spacing = 1
) {
  const upper = text.toUpperCase();
  let cursorX = Math.round(x);

  for (let i = 0; i < upper.length; i++) {
    const glyph = this.getBitmapGlyph(upper[i]);

    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col] !== "X") continue;
        this.drawPixelRect(
          ctx,
          cursorX + col * scale,
          Math.round(y) + row * scale,
          scale,
          scale,
          color
        );
      }
    }

    cursorX += glyph[0].length * scale + spacing * scale;
  }
}

private drawCenteredBitmapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  color = "#f7edd1",
  scale = 2,
  spacing = 1
) {
  const measure = this.measureBitmapText(text, scale, spacing);
  this.drawBitmapText(
    ctx,
    text,
    Math.round(centerX - measure.width / 2),
    Math.round(centerY - measure.height / 2),
    color,
    scale,
    spacing
  );
}

private drawCenteredPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  color = "#f7edd1",
  size = 16
) {
  const scale = size <= 12 ? 1 : size <= 18 ? 2 : 3;
  const spacing = 1;
  this.drawCenteredBitmapText(ctx, text, centerX, centerY, color, scale, spacing);
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

  private px(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size = 4
  ) {
    this.drawPixelRect(ctx, x * size, y * size, size, size, color);
  }

  private drawPixelBlock(
    ctx: CanvasRenderingContext2D,
    rows: string[],
    palette: Record<string, string>,
    ox: number,
    oy: number,
    pixelSize = 4
  ) {
    for (let row = 0; row < rows.length; row++) {
      const line = rows[row];
      for (let col = 0; col < line.length; col++) {
        const cell = line[col];
        if (cell === "." || !palette[cell]) continue;
        this.drawPixelRect(
          ctx,
          ox + col * pixelSize,
          oy + row * pixelSize,
          pixelSize,
          pixelSize,
          palette[cell]
        );
      }
    }
  }

private drawSun(ctx: CanvasRenderingContext2D, width: number) {
  const px = 10;
  const sunX = width - 240;
  const sunY = 86 + Math.sin(this.time * 0.35) * 2;

  // soft chunky glow
  this.drawPixelRect(ctx, sunX - 20, sunY - 20, 140, 140, "#fff3b8", 0.10);
  this.drawPixelRect(ctx, sunX - 10, sunY - 10, 120, 120, "#ffe896", 0.12);

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
      const isUpperLit = row < 5;

      let color = "#ffd54d";
      if (isCore) color = "#fff6b8";
      else if (isUpperLit) color = "#ffe680";

      this.drawPixelRect(
        ctx,
        sunX + col * px,
        sunY + row * px,
        px,
        px,
        color
      );
    }
  }

  // little chunky rays
  this.drawPixelRect(ctx, sunX + 50, sunY - 28, 40, 10, "#fff2a3", 0.9);
  this.drawPixelRect(ctx, sunX + 50, sunY + 158, 40, 10, "#fff2a3", 0.9);
  this.drawPixelRect(ctx, sunX - 28, sunY + 50, 10, 40, "#fff2a3", 0.9);
  this.drawPixelRect(ctx, sunX + 158, sunY + 50, 10, 40, "#fff2a3", 0.9);

  // tiny highlights
  this.drawPixelRect(ctx, sunX + 44, sunY + 28, 10, 10, "#ffffff", 0.55);
  this.drawPixelRect(ctx, sunX + 74, sunY + 44, 10, 10, "#fffdf0", 0.35);
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

  // little underside shadow strip so they pop
  this.drawPixelRect(
    ctx,
    x + 3 * px,
    finalY + 6 * px,
    7 * px,
    1 * px,
    "#bde9f7",
    0.9
  );

  // top sparkle highlight
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

  this.drawPixelRect(ctx, 0, height * 0.46, width, height * 0.08, "#4e5a17");
  this.drawPixelRect(ctx, 0, height * 0.54, width, height * 0.06, "#7a4524");

  // ============================================
  // ATMOSPHERIC FADE INTO WORLD
  // ============================================

  this.drawPixelRect(ctx, 0, height * 0.60, width, height * 0.08, "#106124");
  }


private drawMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const farBaseY = height * 0.48;
  const midBaseY = height * 0.56;

  // far range
  for (let i = -1; i < 8; i++) {
    const x = i * 210;

    ctx.fillStyle = "#9fbdd0";
    ctx.beginPath();
    ctx.moveTo(this.snap(x), this.snap(farBaseY));
    ctx.lineTo(this.snap(x + 100), this.snap(farBaseY - 110));
    ctx.lineTo(this.snap(x + 200), this.snap(farBaseY));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#cfe1ea";
    ctx.beginPath();
    ctx.moveTo(this.snap(x + 62), this.snap(farBaseY - 56));
    ctx.lineTo(this.snap(x + 100), this.snap(farBaseY - 110));
    ctx.lineTo(this.snap(x + 132), this.snap(farBaseY - 52));
    ctx.closePath();
    ctx.fill();
  }

  // mid range
  for (let i = -1; i < 7; i++) {
    const x = i * 240 + 40;

    ctx.fillStyle = "#6f8ea3";
    ctx.beginPath();
    ctx.moveTo(this.snap(x), this.snap(midBaseY));
    ctx.lineTo(this.snap(x + 120), this.snap(midBaseY - 145));
    ctx.lineTo(this.snap(x + 240), this.snap(midBaseY));
    ctx.closePath();
    ctx.fill();

    // lit face
    ctx.fillStyle = "#8faaba";
    ctx.beginPath();
    ctx.moveTo(this.snap(x + 120), this.snap(midBaseY - 145));
    ctx.lineTo(this.snap(x + 240), this.snap(midBaseY));
    ctx.lineTo(this.snap(x + 155), this.snap(midBaseY));
    ctx.closePath();
    ctx.fill();

    // snow cap / highlight
    ctx.fillStyle = "#d8e6ee";
    ctx.beginPath();
    ctx.moveTo(this.snap(x + 72), this.snap(midBaseY - 68));
    ctx.lineTo(this.snap(x + 120), this.snap(midBaseY - 145));
    ctx.lineTo(this.snap(x + 158), this.snap(midBaseY - 72));
    ctx.closePath();
    ctx.fill();

    // lower haze strip
    this.drawPixelRect(ctx, x + 10, midBaseY - 4, 220, 8, "#738578");
  }

  // horizon mist to blend mountains into world
  this.drawPixelRect(ctx, 0, height * 0.56, width, height * 0.035, "#432c14");
}

  private drawTreeLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const baseY = height * 0.62;

  for (let i = -1; i < 18; i++) {
    const x = i * 80;

    const trunkX = x + 26;
    const trunkW = 10;
    const trunkH = 34;

    const canopyW = 52;
    const canopyOffset = (i % 2 === 0 ? 0 : 6); // subtle variation

    // ============================================
    // SHADOW (grounded, soft)
    // ============================================
    this.drawPixelRect(ctx, x + 22, baseY + 4, 22, 6, "rgba(0,0,0,0.18)");
    this.drawPixelRect(ctx, x + 18, baseY + 8, 30, 4, "rgba(0,0,0,0.12)");

    // ============================================
    // TRUNK (with light side)
    // ============================================
    this.drawPixelRect(ctx, trunkX, baseY - trunkH, trunkW, trunkH, "#462f19");

    // light edge (sun from right)
    this.drawPixelRect(
      ctx,
      trunkX + trunkW - 2,
      baseY - trunkH,
      2,
      trunkH,
      "#7a5230"
    );

    // ============================================
    // CANOPY BASE (dark mass)
    // ============================================
    this.drawPixelRect(
      ctx,
      x + 6 + canopyOffset,
      baseY - 50,
      canopyW,
      20,
      "#2d6a2f"
    );

    // mid layer
    this.drawPixelRect(
      ctx,
      x + 12 + canopyOffset,
      baseY - 68,
      40,
      22,
      "#377936"
    );

    // top
    this.drawPixelRect(
      ctx,
      x + 16 + canopyOffset,
      baseY - 86,
      32,
      20,
      "#4b9743"
    );

    // ============================================
    // SUN HIGHLIGHT (right-facing)
    // ============================================
    this.drawPixelRect(
      ctx,
      x + 36 + canopyOffset,
      baseY - 72,
      10,
      14,
      "#6fcf6a"
    );

    // ============================================
    // EDGE BREAKUP (less blocky)
    // ============================================
    this.drawPixelRect(ctx, x + canopyOffset, baseY - 46, 8, 8, "#2d6a2f");
    this.drawPixelRect(ctx, x + 46 + canopyOffset, baseY - 46, 8, 8, "#377936");
  }
}
  private getSunPosition(width: number) {
    return {
      x: width - 174,
      y: 152,
    };
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

  private drawVillage(
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
  const horizonY = Math.floor(height * 0.72);
  const roadWidthAtHorizon = width * 0.4;
  const centerX = width / 2;

  // ============================================
  // BASE GROUND / DIRT UNDER EVERYTHING
  // ============================================
  this.drawPixelRect(ctx, 0, horizonY, width, height - horizonY, "#8b7355");

  let currentY = horizonY;
  let rowIndex = 0;
  let segmentH = 8;

  while (currentY < height) {
    const rowY = currentY;

    // rows get taller as they come toward camera
    segmentH += 4;

    // road widens as it approaches camera
    const roadWidth = roadWidthAtHorizon + rowIndex * 60;
    const roadLeft = centerX - roadWidth / 2;
    const roadRight = centerX + roadWidth / 2;

    // ============================================
    // GRASS SHOULDERS
    // ============================================
    // left grass
    this.drawPixelRect(ctx, 0, rowY, roadLeft, segmentH, rowIndex % 2 === 0 ? "#4d9b47" : "#5dae56");
    // right grass
    this.drawPixelRect(
      ctx,
      roadRight,
      rowY,
      width - roadRight,
      segmentH,
      rowIndex % 2 === 0 ? "#4d9b47" : "#5dae56"
    );

    // add a little chunky grass texture
    for (let gx = 0; gx < roadLeft; gx += 28) {
      this.drawPixelRect(ctx, gx + (rowIndex % 2) * 8, rowY + 2, 10, 4, "#6ab85d");
    }
    for (let gx = roadRight; gx < width; gx += 28) {
      this.drawPixelRect(ctx, gx + (rowIndex % 2) * 8, rowY + 2, 10, 4, "#6ab85d");
    }

    // ============================================
    // ROAD EDGE / CURB STRIPS
    // ============================================
    this.drawPixelRect(ctx, roadLeft, rowY, 8, segmentH, "#6f5a3d");
    this.drawPixelRect(ctx, roadRight - 8, rowY, 8, segmentH, "#6f5a3d");

    this.drawPixelRect(ctx, roadLeft + 2, rowY, 2, segmentH, "#9d845f");
    this.drawPixelRect(ctx, roadRight - 6, rowY, 2, segmentH, "#4e3d29");

    // ============================================
    // COBBLE ROAD
    // ============================================
    const tileW = 48 + rowIndex * 4;
    const rowOffset = rowIndex % 2 === 0 ? 0 : tileW / 2;

    for (
      let x = roadLeft - tileW;
      x < roadRight + tileW;
      x += tileW
    ) {
      const tx = x + rowOffset;
      const tileRight = tx + tileW - 4;

      if (tileRight <= roadLeft + 8 || tx >= roadRight - 8) continue;

      const clippedX = Math.max(tx, roadLeft + 8);
      const clippedRight = Math.min(tileRight, roadRight - 8);
      const drawW = clippedRight - clippedX;

      if (drawW <= 6) continue;

      const isDark = ((Math.floor(x / tileW) + rowIndex) & 1) === 0;
      const stoneColor = isDark ? "#b1936b" : "#c4a675";

      // main stone
      this.drawPixelRect(ctx, clippedX, rowY, drawW, segmentH - 4, stoneColor);

      // top highlight
      this.drawPixelRect(ctx, clippedX, rowY, drawW, 4, "#dec5a0", 0.5);

      // left highlight
      this.drawPixelRect(ctx, clippedX, rowY, 4, segmentH - 4, "#dec5a0", 0.25);

      // bottom shadow
      this.drawPixelRect(
        ctx,
        clippedX,
        rowY + segmentH - 8,
        drawW,
        4,
        "#7a5e3f",
        0.5
      );

      // right shadow
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

  // ============================================
  // HORIZON TRIM
  // ============================================
  this.drawPixelRect(ctx, 0, horizonY - 8, width, 4, "#6ab85d");
  this.drawPixelRect(ctx, 0, horizonY - 4, width, 4, "#1a2e14");
}
  private drawFountain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const cx = 180;
  const cy = height * 0.79;

  const flow = this.time * 120;
  const pulse = Math.sin(this.time * 3.2) * 2;
  const shimmer = Math.sin(this.time * 4.4) > 0.2;

  // ============================================
  // GROUND SHADOW
  // ============================================
  this.drawPixelRect(ctx, cx - 58, cy + 16, 116, 8, "rgba(176, 30, 30, 0.16)");
  this.drawPixelRect(ctx, cx - 42, cy + 22, 84, 4, "rgba(0,0,0,0.10)");

  // ============================================
  // BASIN BASE
  // ============================================
  this.drawPixelRect(ctx, cx - 54, cy - 10, 108, 28, "#8e939b");
  this.drawPixelRect(ctx, cx - 50, cy - 6, 100, 20, "#9da3ac");

  // top lip
  this.drawPixelRect(ctx, cx - 44, cy - 18, 88, 12, "#aeb4bd");
  this.drawPixelRect(ctx, cx - 40, cy - 14, 80, 4, "#c7ccd3");

  // front shadow band
  this.drawPixelRect(ctx, cx - 50, cy + 10, 100, 4, "#737983");

  // ============================================
  // WATER POOL
  // ============================================
  this.drawPixelRect(ctx, cx - 26, cy - 8, 52, 8, "#74d6ff");
  this.drawPixelRect(ctx, cx - 22, cy - 6, 44, 4, "#9ee7ff");

  // moving ripple bands
  const rippleShift = Math.floor((flow * 0.08) % 12);
  this.drawPixelRect(ctx, cx - 20 + rippleShift, cy - 6, 8, 2, "#d9fbff");
  this.drawPixelRect(ctx, cx - 2 + ((rippleShift + 5) % 16), cy - 4, 10, 2, "#d9fbff");
  this.drawPixelRect(ctx, cx - 18 + ((rippleShift + 9) % 20), cy - 2, 6, 2, "#bff5ff");

  // ============================================
  // COLUMN
  // ============================================
  this.drawPixelRect(ctx, cx - 8, cy - 52, 16, 34, "#7d838c");
  this.drawPixelRect(ctx, cx - 4, cy - 52, 4, 34, "#a8afb7");
  this.drawPixelRect(ctx, cx + 4, cy - 52, 4, 34, "#676d76");

  // top cap
  this.drawPixelRect(ctx, cx - 22, cy - 64, 44, 12, "#a7adb6");
  this.drawPixelRect(ctx, cx - 16, cy - 52, 32, 8, "#9198a2");
  this.drawPixelRect(ctx, cx - 12, cy - 60, 24, 4, "#c8cdd4");

  // ============================================
  // MAIN WATER STREAM
  // ============================================
  const streamTopY = cy - 88;
  const streamBottomY = cy - 12;
  const streamHeight = streamBottomY - streamTopY;

  // outer stream
  this.drawPixelRect(ctx, cx - 4, streamTopY, 8, streamHeight, "#8eeaff");

  // inner bright stream
  this.drawPixelRect(ctx, cx - 1, streamTopY, 2, streamHeight, "#e5fdff");

  // animated bands in the stream so it feels like flowing water
  for (let y = 0; y < streamHeight; y += 12) {
    const stripeY = streamTopY + ((y + Math.floor(flow)) % streamHeight);
    this.drawPixelRect(ctx, cx - 4, stripeY, 8, 2, "#baf6ff");
  }

  // slight width pulse near middle
  this.drawPixelRect(ctx, cx - 5, cy - 48 + pulse * 0.3, 10, 6, "#9eefff");

  // ============================================
  // IMPACT / SPLASH
  // ============================================
  const splashY = cy - 10;

  // center splash burst
  this.drawPixelRect(ctx, cx - 8, splashY, 16, 2, "#d8fbff");
  this.drawPixelRect(ctx, cx - 4, splashY - 2, 8, 2, "#ffffff");

  // side flicks
  this.drawPixelRect(ctx, cx - 12, splashY - 4 - (Math.sin(this.time * 8) > 0 ? 2 : 0), 4, 2, "#d8fbff");
  this.drawPixelRect(ctx, cx + 8, splashY - 3 - (Math.cos(this.time * 7) > 0 ? 2 : 0), 4, 2, "#d8fbff");

  // falling droplets
  const drop1Y = cy - 24 + ((flow * 0.55) % 14);
  const drop2Y = cy - 20 + ((flow * 0.72 + 6) % 12);

  this.drawPixelRect(ctx, cx - 10, drop1Y, 2, 2, "#d8fbff");
  this.drawPixelRect(ctx, cx + 8, drop2Y, 2, 2, "#d8fbff");

  // ============================================
  // SPARKLES
  // ============================================
  if (shimmer) {
    this.drawPixelRect(ctx, cx - 30, cy - 4, 2, 2, "#ffffff");
    this.drawPixelRect(ctx, cx + 24, cy - 6, 2, 2, "#ffffff");
    this.drawPixelRect(ctx, cx + 3, cy - 72, 2, 2, "#ffffff");
  }

  // ============================================
  // SMALL EDGE PLANTS
  // ============================================
  this.drawPixelRect(ctx, cx - 72, cy + 2, 14, 10, "#4c9a47");
  this.drawPixelRect(ctx, cx - 66, cy - 4, 10, 8, "#6bc161");

  this.drawPixelRect(ctx, cx + 58, cy + 4, 14, 10, "#3f8738");
  this.drawPixelRect(ctx, cx + 60, cy - 2, 10, 8, "#5eb854");
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

private drawPixelIconMail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  const palette = {
    outline: "#4b2e17",
    shadow: "#60391b",
    bodyLight: "#f1dfb1",
    bodyMid: "#d8ba78",
    flap: "#bc743c",
    flapLight: "#d18a4e",
    seal: "#e4bf63",
  };

  // outer body
  this.drawPixelBlock(
    ctx,
    [
      "....OOOOOOOO....",
      "..OOLLLLLLLLOO..",
      ".OLLMMMMMMMMLLO.",
      "OLMMMMMMMMMMMLO.",
      "OLMMMMMMMMMMMLO.",
      "OLMMMMMMMMMMMLO.",
      "OLMMMMMMMMMMMLO.",
      ".OLLMMMMMMMMLLO.",
      "..OOOOOOOOOOOO..",
    ],
    {
      O: palette.outline,
      L: palette.bodyLight,
      M: palette.bodyMid,
    },
    x,
    y,
    3
  );

  // top flap
  this.drawPixelBlock(
    ctx,
    [
      "....FFFFFFFF....",
      "...FFffffFF.....",
      "..FFffFFffFF....",
      ".FFffF..FffFF...",
      "FFffF....FffFF..",
    ],
    {
      F: palette.flap,
      f: palette.flapLight,
    },
    x,
    y + 3,
    3
  );

  // inner letter crease
  this.drawPixelBlock(
    ctx,
    [
      "..S..........S..",
      "...SS......SS...",
      ".....SS..SS.....",
      ".......SS.......",
    ],
    {
      S: palette.shadow,
    },
    x + 3,
    y + 12,
    3
  );

  // little seal
  this.drawPixelRect(ctx, x + 21, y + 18, 6, 6, palette.seal);

  // bottom lip / depth
  this.drawPixelRect(ctx, x + 6, y + 24, 30, 3, palette.shadow);
}

private drawPixelIconShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  const palette = {
    outline: "#4b2e17",
    dark: "#8f6a25",
    mid: "#c89c3a",
    light: "#f4df91",
    highlight: "#ffe9a8",
  };

  this.drawPixelBlock(
    ctx,
    [
      "...OOOOOOO...",
      "..OMMMMMMMO..",
      ".OMMMMMMMMMO.",
      ".OMMMMMMMMMO.",
      ".OMMMMMMMMMO.",
      "..OMMMMMMMO..",
      "..OMMMMMMMO..",
      "...OMMMMOO...",
      "....OMMO.....",
      ".....OO......",
    ],
    {
      O: palette.outline,
      M: palette.mid,
    },
    x,
    y,
    3
  );

  this.drawPixelBlock(
    ctx,
    [
      "...DDDDD.....",
      "..DDDDDDD....",
      ".DDDDDDDDD...",
      ".DDDDDDDDD...",
      "..DDDDDDD....",
    ],
    {
      D: palette.dark,
    },
    x + 6,
    y + 6,
    3
  );

  this.drawPixelBlock(
    ctx,
    [
      "....H....",
      "....H....",
      "....H....",
      "....H....",
      "....H....",
      "....H....",
    ],
    {
      H: palette.highlight,
    },
    x + 15,
    y + 6,
    3
  );

  this.drawPixelRect(ctx, x + 12, y + 6, 18, 3, palette.light);
  this.drawPixelRect(ctx, x + 15, y + 27, 12, 3, palette.dark);
}

private drawPixelIconDaily(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  const palette = {
    outline: "#4b2e17",
    topBar: "#b94b4b",
    topBarLight: "#cf6767",
    paperLight: "#e7dbbb",
    paperMid: "#d9cba6",
    date: "#72a9db",
    dateDark: "#5b89b4",
    ring: "#d8bd7429",
    shadow: "#60391b",
  };

  // outer card
  this.drawPixelBlock(
    ctx,
    [
      "...OOOOOOOOOO...",
      "..OTTTTTTTTTTO..",
      ".OTTTTTTTTTTTTO.",
      ".OPPPPPPPPPPPPO.",
      ".OPPPPPPPPPPPPO.",
      ".OPPPPPPPPPPPPO.",
      ".OPPPPPPPPPPPPO.",
      ".OPPPPPPPPPPPPO.",
      "..OOOOOOOOOOOO..",
    ],
    {
      O: palette.outline,
      T: palette.topBar,
      P: palette.paperLight,
    },
    x,
    y + 3,
    3
  );

  // top bar highlight
  this.drawPixelRect(ctx, x + 9, y + 6, 24, 3, palette.topBarLight);

  // binder rings
  this.drawPixelBlock(
    ctx,
    [
      "RR..RR",
      "RO..OR",
      "RR..RR",
    ],
    {
      R: palette.ring,
      O: palette.outline,
    },
    x + 12,
    y,
    3
  );

  // paper depth
  this.drawPixelRect(ctx, x + 9, y + 18, 30, 18, palette.paperMid);

  // date grid
  const cell = 6;
  const startX = x + 12;
  const startY = y + 21;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const px = startX + col * 9;
      const py = startY + row * 9;
      this.drawPixelRect(ctx, px, py, cell, cell, palette.date);
      this.drawPixelRect(ctx, px, py + 3, cell, 3, palette.dateDark);
    }
  }

  // little current-day highlight square in middle
  this.drawPixelRect(ctx, x + 21, y + 30, 6, 6, palette.ring);

  // bottom shadow lip
  this.drawPixelRect(ctx, x + 12, y + 39, 24, 3, palette.shadow);
}
  private drawTopMenuBar(ctx: CanvasRenderingContext2D) {
  const x = 120;
  const y = 18;
  const width = 500;
  const height = 84;

  // outer frame
  this.drawPixelRect(ctx, x - 6, y - 6, width + 12, height + 12, "#3a2110");

  // main wood board
  this.drawWoodBoard(ctx, x, y, width, height, false);

  // top bevel
  this.drawPixelRect(ctx, x + 10, y + 10, width - 20, 4, "#f0cf8a");

  // inner shadow
  this.drawPixelRect(ctx, x + 10, y + height - 14, width - 20, 4, "#4a2d15");

  // inner panel where icons live
  this.drawPixelRect(ctx, x + 18, y + 20, width - 36, height - 40, "#6f4522");
  this.drawPixelRect(ctx, x + 22, y + 24, width - 44, height - 48, "#8a5a2c");

  // plank split lines
  this.drawPixelRect(ctx, x + 90, y + 24, 4, height - 48, "#6a411f");
  this.drawPixelRect(ctx, x + 190, y + 24, 4, height - 48, "#6a411f");
  this.drawPixelRect(ctx, x + 290, y + 24, 4, height - 48, "#6a411f");
  this.drawPixelRect(ctx, x + 390, y + 24, 4, height - 48, "#6a411f");

  // top decorative trim
  this.drawPixelRect(ctx, x + 18, y + 18, width - 36, 4, "#d9b377");

  // bottom decorative trim
  this.drawPixelRect(ctx, x + 18, y + height - 22, width - 36, 4, "#4f3218");

  // corner metal / gold caps
  this.drawPixelRect(ctx, x + 12, y + 12, 12, 12, "#c89c3a");
  this.drawPixelRect(ctx, x + width - 24, y + 12, 12, 12, "#c89c3a");
  this.drawPixelRect(ctx, x + 12, y + height - 24, 12, 12, "#8f6a25");
  this.drawPixelRect(ctx, x + width - 24, y + height - 24, 12, 12, "#8f6a25");

  // little rivets
  this.drawPixelRect(ctx, x + 15, y + 15, 4, 4, "#f4df91");
  this.drawPixelRect(ctx, x + width - 19, y + 15, 4, 4, "#f4df91");
  this.drawPixelRect(ctx, x + 15, y + height - 19, 4, 4, "#d4aa44");
  this.drawPixelRect(ctx, x + width - 19, y + height - 19, 4, 4, "#d4aa44");
}

  private drawParticles(ctx: CanvasRenderingContext2D) {
  for (const p of this.particles) {
    const swayX = Math.sin(this.time * 0.6 + p.sway) * 0.8;
    const floatY = Math.sin(this.time * 0.8 + p.sway) * 0.6;

    const flicker = 0.85 + Math.sin(this.time * 6 + p.sway) * 0.15;

    const x = p.x + swayX;
    const y = p.y + floatY;
    const r = p.r * flicker;

    // warm color instead of pure white
    const color = `rgba(255, 235, 180, ${p.alpha})`;

    ctx.save();

    // outer glow
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 220, 140, ${p.alpha * 0.25})`;
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // mid glow
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 240, 200, ${p.alpha * 0.5})`;
    ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
private drawPixelUiButton(
  ctx: CanvasRenderingContext2D,
  button: SimpleUiButton | MonsterOptionButton,
  label: string,
  color: "wood" | "blue" | "gold" = "wood"
) {
  ctx.save();

  const hovered = button.hovered;
  const pressOffset = hovered ? -2 : 0;

  let outline = "#2f1a0c";
  let shadow = "#4a2914";
  let dark = "#6a3c1c";
  let mid = "#8a5428";
  let light = "#b6783d";
  let highlight = "#e2ae68";
  let text = "#f7e7bf";

  if (color === "blue") {
    outline = "#1d2c44";
    shadow = "#24344f";
    dark = "#355983";
    mid = "#4f79aa";
    light = "#7fa8d8";
    highlight = "#c7defb";
    text = "#eef6ff";
  }

  if (color === "gold") {
    outline = "#53320e";
    shadow = "#69441a";
    dark = "#94611f";
    mid = "#bc8230";
    light = "#ddb25a";
    highlight = "#f6db91";
    text = "#fff4cf";
  }

  const x = this.snap(button.x);
  const y = this.snap(button.y);
  const w = this.snap(button.width);
  const h = this.snap(button.height);

  // outer frame
  this.drawPixelRect(ctx, x, y, w, h, outline);

  // drop shadow
  this.drawPixelRect(ctx, x + 4, y + 4, w - 4, h - 4, shadow);

  // face
  this.drawPixelRect(ctx, x + 4, y + 2 + pressOffset, w - 8, h - 8, dark);
  this.drawPixelRect(ctx, x + 8, y + 6 + pressOffset, w - 16, h - 16, mid);

  // chunk bevel
  this.drawPixelRect(ctx, x + 4, y + 2 + pressOffset, w - 8, 4, highlight);
  this.drawPixelRect(ctx, x + 4, y + 6 + pressOffset, 4, h - 16, light);
  this.drawPixelRect(ctx, x + w - 8, y + 6 + pressOffset, 4, h - 16, shadow);
  this.drawPixelRect(ctx, x + 4, y + h - 8 + pressOffset, w - 8, 4, outline);

  // inset center strip so it feels built from tiles
  this.drawPixelRect(ctx, x + 12, y + 12 + pressOffset, w - 24, h - 24, dark);
  this.drawPixelRect(ctx, x + 12, y + 12 + pressOffset, w - 24, 2, highlight);

  // studs
  this.drawPixelRect(ctx, x + 8, y + 8 + pressOffset, 4, 4, highlight);
  this.drawPixelRect(ctx, x + w - 12, y + 8 + pressOffset, 4, 4, highlight);
  this.drawPixelRect(ctx, x + 8, y + h - 12 + pressOffset, 4, 4, shadow);
  this.drawPixelRect(ctx, x + w - 12, y + h - 12 + pressOffset, 4, 4, shadow);

  this.drawCenteredBitmapText(
    ctx,
    label.toUpperCase(),
    x + w / 2,
    y + h / 2 + pressOffset,
    text,
    h >= 44 ? 2 : 1,
    1
  );

  ctx.restore();
}

  private drawMonsterPanel(ctx: CanvasRenderingContext2D) {
  const centerX = this.monsterArea.x + this.monsterArea.width / 2;
  const pedestalBaseY = this.monsterArea.y + this.monsterArea.height + 6;

  // soft ground shadow under pedestal
  this.drawPixelRect(ctx, centerX - 96, pedestalBaseY + 18, 192, 8, "rgba(0,0,0,0.18)");
  this.drawPixelRect(ctx, centerX - 70, pedestalBaseY + 24, 140, 4, "rgba(0,0,0,0.10)");

  // pedestal bottom
  this.drawPixelRect(ctx, centerX - 92, pedestalBaseY - 6, 184, 28, "#7f8791");
  this.drawPixelRect(ctx, centerX - 84, pedestalBaseY, 168, 16, "#9aa2ac");

  // pedestal top slab
  this.drawPixelRect(ctx, centerX - 72, pedestalBaseY - 18, 144, 16, "#b4bac2");
  this.drawPixelRect(ctx, centerX - 64, pedestalBaseY - 14, 128, 6, "#d4d8de");

  // front lip / shadow
  this.drawPixelRect(ctx, centerX - 84, pedestalBaseY + 12, 168, 4, "#6b737d");

  // little side blocks so it feels more "summon hall"
  this.drawPixelRect(ctx, centerX - 112, pedestalBaseY - 2, 20, 20, "#6f7781");
  this.drawPixelRect(ctx, centerX + 92, pedestalBaseY - 2, 20, 20, "#6f7781");

  // top accent line
  this.drawPixelRect(ctx, centerX - 40, pedestalBaseY - 26, 80, 4, "#e7ebef");
}

private drawHomeMonster(ctx: CanvasRenderingContext2D) {
  const centerX = this.monsterArea.x + this.monsterArea.width / 2;
  const textY = this.monsterArea.y + 380;
  const pedestalBaseY = this.monsterArea.y + this.monsterArea.height + 6;
  const monsterRootY = pedestalBaseY - 170;
  const bob = Math.sin(this.time * 1.4) * 4;

  this.drawMonsterPanel(ctx);

  if (this.selectedMonsterId) {
    const monster = monsterRegistry[this.selectedMonsterId];

    if (monster) {
      // floating title, no giant wood panel
      this.drawCenteredPixelText(
        ctx,
        monster.name.toUpperCase(),
        centerX,
        textY,
        "#f9efcf",
        20
      );

      this.drawCenteredPixelText(
        ctx,
        "HOME MINDER EQUIPPED",
        centerX,
        textY + 26,
        "#e0c892",
        12
      );

      // monster shadow on pedestal
      this.drawPixelRect(ctx, centerX - 48, pedestalBaseY - 8, 96, 8, "rgba(0,0,0,0.18)");
      this.drawPixelRect(ctx, centerX - 34, pedestalBaseY - 4, 68, 4, "rgba(0,0,0,0.10)");

      drawMonster(monster, {
        ctx,
        x: centerX,
        y: monsterRootY + bob,
        time: this.time,
        mouseX: this.mouseX,
        mouseY: this.mouseY,
        state: "HOME",
      });
    } else {
      this.drawCenteredPixelText(
        ctx,
        "MONSTER MISSING",
        centerX,
        this.monsterArea.y + this.monsterArea.height / 2,
        "#f9efcf",
        20
      );

      this.drawCenteredPixelText(
        ctx,
        "REGISTRY ENTRY NOT FOUND",
        centerX,
        this.monsterArea.y + this.monsterArea.height / 2 + 28,
        "#d8c4a0",
        12
      );
    }
  } else {
    this.drawCenteredPixelText(
      ctx,
      "NO MINDER SELECTED",
      centerX,
      this.monsterArea.y + this.monsterArea.height / 2,
      "#f9efcf",
      18
    );

    this.drawCenteredPixelText(
      ctx,
      "PICK A MONSTER BELOW",
      centerX,
      this.monsterArea.y + this.monsterArea.height / 2 + 28,
      "#d8c4a0",
      12
    );
  }

  this.drawPixelUiButton(
    ctx,
    this.changeMonsterButton,
    "CHANGE MINDER",
    "gold"
  );

  this.drawPixelUiButton(ctx, this.devTestButton, "DEV TEST", "blue");
}
  private drawMonsterPicker(ctx: CanvasRenderingContext2D) {
    if (!this.isMonsterPickerOpen) return;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.drawWoodBoard(
      ctx,
      this.monsterPickerBounds.x,
      this.monsterPickerBounds.y,
      this.monsterPickerBounds.width,
      this.monsterPickerBounds.height,
      false
    );

    this.drawCenteredPixelText(
      ctx,
      "SELECT MINDER",
      this.monsterPickerBounds.x + this.monsterPickerBounds.width / 2,
      this.monsterPickerBounds.y + 34,
      "#fff0c7",
      18
    );

    this.drawCenteredPixelText(
      ctx,
      "SCROLL TO BROWSE",
      this.monsterPickerBounds.x + this.monsterPickerBounds.width / 2,
      this.monsterPickerBounds.y + 60,
      "#dec28f",
      12
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.monsterListViewport.x,
      this.monsterListViewport.y,
      this.monsterListViewport.width,
      this.monsterListViewport.height
    );
    ctx.clip();

    this.monsterOptionButtons.forEach((button) => {
      if (!this.isButtonVisibleInMonsterList(button)) return;
      this.drawPixelUiButton(ctx, button, button.label.toUpperCase(), "wood");
    });

    ctx.restore();

    const trackX = this.monsterListViewport.x + this.monsterListViewport.width - 10;
    const trackY = this.monsterListViewport.y;
    const trackW = 8;
    const trackH = this.monsterListViewport.height;

    this.drawPixelRect(ctx, trackX, trackY, trackW, trackH, "#4a3017");
    this.drawPixelRect(ctx, trackX + 2, trackY + 2, trackW - 4, trackH - 4, "#7a522d");

    const maxScroll = Math.max(
      0,
      this.monsterListContentHeight - this.monsterListViewport.height
    );

    if (maxScroll > 0) {
      const thumbH = Math.max(
        36,
        (this.monsterListViewport.height / this.monsterListContentHeight) *
          this.monsterListViewport.height
      );

      const thumbY =
        trackY +
        (this.monsterListScrollY / maxScroll) * (trackH - thumbH);

      this.drawPixelRect(ctx, trackX + 1, thumbY, trackW - 2, thumbH, "#d5b072");
    }

    this.drawPixelUiButton(ctx, this.closePickerButton, "CLOSE", "wood");

    ctx.restore();
  }

private drawButton(ctx: CanvasRenderingContext2D, button: HubButton) {
  ctx.save();

  const pulse = button.hoverAnim;
  const hoverScale = 1 + pulse * 0.04;
  const drawWidth = button.width * hoverScale;
  const drawHeight = button.height * hoverScale;

  const drawX = button.x - (drawWidth - button.width) / 2;
  const drawY =
    button.y - (drawHeight - button.height) / 2 +
    button.floatOffset -
    pulse * 2;

  const px = Math.round(drawX);
  const py = Math.round(drawY);

this.drawPixelUiButton(
  ctx,
  {
    x: px,
    y: py,
    width: drawWidth,
    height: drawHeight,
    hovered: false, // 👈 kill flat hover
  },
  "",
  "wood"
);

  this.drawHubButtonOverlay(
    ctx,
    button,
    px,
    py,
    Math.round(drawWidth),
    Math.round(drawHeight)
  );

  this.drawPixelButtonText(
    ctx,
    button.label.toUpperCase(),
    px + drawWidth / 2,
    py + drawHeight - 18,
    button.hovered
  );

  ctx.restore();
}

private drawHubButtonOverlay(
  ctx: CanvasRenderingContext2D,
  button: HubButton,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iconX = x + Math.round(w / 2 - 24);
  const iconY = y + 12;

  switch (button.label) {
    case "Campaign":
      this.drawHubIconCampaign(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Konjure":
      this.drawHubIconKonjure(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Online":
      this.drawHubIconOnline(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Inventory":
      this.drawHubIconInventory(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Guild":
      this.drawHubIconGuild(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Shop":
      this.drawHubIconShop(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Encyclopedia":
      this.drawHubIconEncyclopedia(ctx, iconX, iconY, button.hoverAnim);
      break;
    case "Summons":
     const transitionBoost = this.isSummonTransitioning
     ? Math.min(1, this.summonTransitionTimer / this.summonTransitionDuration)
    : 0;

    const summonAnim = Math.max(button.hoverAnim, transitionBoost);

    this.drawHubIconSummons(ctx, iconX, iconY, summonAnim);
     break;
  }
}

//---------buttons----//
private drawHubIconCampaign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  const bob = Math.round(Math.sin(this.time * 3.2) * anim * 2);

  // map
  this.drawPixelRect(ctx, x + 2, y + 8, 42, 26, "#dbc38e");
  this.drawPixelRect(ctx, x + 4, y + 10, 38, 22, "#efe0ad");
  this.drawPixelRect(ctx, x + 14, y + 10, 2, 22, "#b6975f");
  this.drawPixelRect(ctx, x + 28, y + 10, 2, 22, "#b6975f");

  // dotted trail
  this.drawPixelRect(ctx, x + 10, y + 18, 4, 2, "#8a6b34");
  this.drawPixelRect(ctx, x + 18, y + 20, 4, 2, "#8a6b34");
  this.drawPixelRect(ctx, x + 26, y + 16, 4, 2, "#8a6b34");
  this.drawPixelRect(ctx, x + 34, y + 22, 4, 2, "#8a6b34");

  // flag pole
  this.drawPixelRect(ctx, x + 34, y + 4 - bob, 3, 16, "#6d4a24");

  // flag
  this.drawPixelRect(ctx, x + 37, y + 5 - bob, 10, 6, "#d94f3d");
  if (anim > 0.2) {
    this.drawPixelRect(ctx, x + 45, y + 7 - bob, 2, 2, "#ffcf93");
  }

  // hover glow
  if (anim > 0.01) {
    this.drawPixelRect(ctx, x - 2, y + 2, 50, 36, "#fff0b8", anim * 0.12);
  }
}

private drawHubIconSummons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  const t = this.time;
  const pulse = 1 + Math.sin(t * 4.8) * 0.06 * anim;
  const shimmer = (Math.sin(t * 7.2) * 0.5 + 0.5) * anim;
  const floatY = Math.sin(t * 3.4) * 1.5 * anim;

  const ringW = Math.round(34 * pulse);
  const ringW2 = Math.round(24 * pulse);

  // ============================================
  // MAGIC FLOOR SHADOW
  // ============================================
  this.drawPixelRect(
    ctx,
    x + 8 - (ringW - 34) / 2,
    y + 30,
    ringW,
    3,
    "rgba(0,0,0,0.18)"
  );

  // ============================================
  // OUTER SUMMON RING
  // ============================================
  this.drawPixelRect(
    ctx,
    x + 7 - (ringW - 34) / 2,
    y + 24,
    ringW,
    3,
    "#4ec5ff"
  );
  this.drawPixelRect(
    ctx,
    x + 10 - (ringW2 - 24) / 2,
    y + 20,
    ringW2,
    3,
    "#b8f3ff"
  );
  this.drawPixelRect(
    ctx,
    x + 13,
    y + 17,
    12,
    2,
    "#e8fdff"
  );

  // ============================================
  // RUNE STONES / PIPS
  // ============================================
  this.drawPixelRect(ctx, x + 8, y + 26, 3, 2, "#dffcff");
  this.drawPixelRect(ctx, x + 20, y + 29, 3, 2, "#dffcff");
  this.drawPixelRect(ctx, x + 34, y + 26, 3, 2, "#dffcff");

  this.drawPixelRect(ctx, x + 12, y + 22, 2, 2, "#8ee7ff");
  this.drawPixelRect(ctx, x + 32, y + 22, 2, 2, "#8ee7ff");

  // ============================================
  // CRYSTAL BASE / COLUMN
  // ============================================
  const crystalY = y + 8 + floatY;

  this.drawPixelRect(ctx, x + 19, crystalY + 12, 10, 3, "#5ecdfd");
  this.drawPixelRect(ctx, x + 21, crystalY + 8, 6, 5, "#8cecff");
  this.drawPixelRect(ctx, x + 22, crystalY + 5, 4, 4, "#c8f8ff");

  // crystal point
  this.drawPixelRect(ctx, x + 23, crystalY + 2, 2, 3, "#efffff");

  // bright core
  this.drawPixelRect(ctx, x + 23, crystalY + 7, 2, 8, "#ffffff");

  // left/right facets
  this.drawPixelRect(ctx, x + 20, crystalY + 9, 1, 4, "#76e0ff");
  this.drawPixelRect(ctx, x + 27, crystalY + 9, 1, 4, "#76e0ff");

  // ============================================
  // SUMMON BEAM
  // ============================================
  if (anim > 0.04) {
    this.drawPixelRect(ctx, x + 22, crystalY - 6, 4, 8, "#9ceeff", 0.45 + shimmer * 0.25);
    this.drawPixelRect(ctx, x + 23, crystalY - 10, 2, 6, "#ffffff", 0.55 + shimmer * 0.35);
  }

  // ============================================
  // SIDE ARC ENERGY
  // ============================================
  if (anim > 0.08) {
    const arcLift = Math.round(Math.sin(t * 8) * 1.5);

    this.drawPixelRect(ctx, x + 13, y + 9 + arcLift, 2, 6, "#78dcff", 0.85);
    this.drawPixelRect(ctx, x + 15, y + 7 + arcLift, 2, 3, "#dffcff", 0.75);

    this.drawPixelRect(ctx, x + 33, y + 9 - arcLift, 2, 6, "#78dcff", 0.85);
    this.drawPixelRect(ctx, x + 31, y + 7 - arcLift, 2, 3, "#dffcff", 0.75);
  }

  // ============================================
  // TOP SPARKS
  // ============================================
  if (anim > 0.12) {
    this.drawPixelRect(ctx, x + 24, y + 1, 1, 2, "#fff6d8");
    this.drawPixelRect(ctx, x + 18, y + 5, 1, 2, "#bdf6ff");
    this.drawPixelRect(ctx, x + 30, y + 5, 1, 2, "#bdf6ff");

    if (shimmer > 0.45) {
      this.drawPixelRect(ctx, x + 21, y + 3, 1, 1, "#ffffff");
      this.drawPixelRect(ctx, x + 27, y + 3, 1, 1, "#ffffff");
    }
  }
}
private drawHubIconShop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  const sparkle = Math.sin(this.time * 8) > 0.35;

  // stall roof
  this.drawPixelRect(ctx, x + 4, y + 6, 36, 8, "#d35b43");
  this.drawPixelRect(ctx, x + 8, y + 14, 28, 6, "#f0d7a4");

  // supports
  this.drawPixelRect(ctx, x + 8, y + 20, 3, 12, "#7a4a24");
  this.drawPixelRect(ctx, x + 33, y + 20, 3, 12, "#7a4a24");

  // counter
  this.drawPixelRect(ctx, x + 4, y + 26, 36, 8, "#9a6030");
  this.drawPixelRect(ctx, x + 4, y + 26, 36, 2, "#d59a58");

  // coin
  this.drawPixelRect(ctx, x + 18, y + 18, 8, 8, "#f1c85a");
  this.drawPixelRect(ctx, x + 20, y + 20, 4, 4, "#ffe79e");

  if (anim > 0.1 && sparkle) {
    this.drawPixelRect(ctx, x + 28, y + 10, 2, 2, "#ffffff");
    this.drawPixelRect(ctx, x + 29, y + 9, 2, 4, "#ffffff");
    this.drawPixelRect(ctx, x + 27, y + 10, 4, 2, "#ffffff");
  }
}

private drawHubIconKonjure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  // placeholder crystal box
  this.drawPixelRect(ctx, x + 12, y + 10, 20, 20, "#9ee7ff", 0.6);
}

private drawHubIconOnline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  // placeholder signal bars
  this.drawPixelRect(ctx, x + 10, y + 20, 6, 10, "#6fd6ff");
  this.drawPixelRect(ctx, x + 18, y + 16, 6, 14, "#6fd6ff");
  this.drawPixelRect(ctx, x + 26, y + 12, 6, 18, "#6fd6ff");
}

private drawHubIconInventory(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  // placeholder chest
  this.drawPixelRect(ctx, x + 10, y + 18, 28, 16, "#9a6030");
  this.drawPixelRect(ctx, x + 10, y + 18, 28, 4, "#d59a58");
}

private drawHubIconGuild(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  // placeholder banner
  this.drawPixelRect(ctx, x + 20, y + 10, 4, 24, "#7a4a24");
  this.drawPixelRect(ctx, x + 24, y + 12, 14, 10, "#d94f3d");
}


private drawHubIconEncyclopedia(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anim: number
) {
  // placeholder book
  this.drawPixelRect(ctx, x + 12, y + 14, 24, 18, "#7a5dc7");
  this.drawPixelRect(ctx, x + 22, y + 14, 2, 18, "#ffffff");
}
//--------end buttons----//

  private drawTopButton(ctx: CanvasRenderingContext2D, button: TopMenuButton) {
  ctx.save();

  const hoverScale = button.hovered ? 1.04 : 1;
  const drawWidth = button.width * hoverScale;
  const drawHeight = button.height * hoverScale;

  const drawX = button.x - (drawWidth - button.width) / 2;
  const drawY =
    button.y - (drawHeight - button.height) / 2 + button.floatOffset;

  const px = Math.round(drawX);
  const py = Math.round(drawY);

  this.drawPixelUiButton(
    ctx,
    {
      x: px,
      y: py,
      width: drawWidth,
      height: drawHeight,
      hovered: false,
    },
    "",
    "wood"
  );

  const iconX = px + drawWidth / 2 - 16;
  const iconY = py + 10;

  if (button.label === "Mail") {
    this.drawPixelIconMail(ctx, iconX, iconY);
  } else if (button.label === "Prestige") {
    this.drawPixelIconShield(ctx, iconX, iconY);
  } else if (button.label === "Daily") {
    this.drawPixelIconDaily(ctx, iconX, iconY);
  }

  this.drawPixelButtonText(
    ctx,
    button.label.toUpperCase(),
    px + drawWidth / 2,
    py + drawHeight - 14,
    button.hovered
  );

  ctx.restore();
}

  private layoutAndDrawTopButtons(ctx: CanvasRenderingContext2D) {
    const barCenterX = 120 + 500 / 2;
    const baseY = 58;

    const slotXs = [barCenterX - 120, barCenterX, barCenterX + 120];
    const topOrder = ["Mail", "Prestige", "Daily"];

    topOrder.forEach((label, index) => {
      const button = this.topButtons.find((b) => b.label === label);
      if (!button) return;

      button.width = 92;
      button.height = 70;
      button.x = slotXs[index] - button.width / 2;
      button.y = baseY - button.height / 2;

      this.drawTopButton(ctx, button);
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    const introT = this.clamp(this.introTimer / this.introDuration, 0, 1);
    const cameraSettle = this.easeOutCubic(introT);
    const cameraDropY = (1 - cameraSettle) * -32;
    const topBarProgress = this.easeOutCubic(
      this.clamp((this.introTimer - 0.12) / 0.48, 0, 1)
    );
    const topBarOffsetY = (1 - topBarProgress) * -120;
    const monsterPanelProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.2) / 0.54, 0, 1)
    );
    const monsterPanelOffsetX = (1 - monsterPanelProgress) * -200;
    const fadeAlpha = 1 - this.clamp(this.introTimer / 0.6, 0, 1);

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    ctx.translate(0, cameraDropY);

    this.drawSky(ctx, width, height);
    this.drawSun(ctx, width);
    this.drawClouds(ctx);
    this.drawPixelCloud(ctx, width, height, this.time)
    this.drawMountains(ctx, width, height);
    this.drawTreeLine(ctx, width, height);
    this.drawVillage(ctx, width, height);
    this.drawGround(ctx, width, height);
    this.drawFountain(ctx, width, height);
    this.drawSummonTransitionOverlay(ctx);
    this.drawCampaignTransitionOverlay(ctx);

    ctx.save();
    ctx.translate(0, topBarOffsetY);
    this.drawTopMenuBar(ctx);
    this.layoutAndDrawTopButtons(ctx);
    ctx.restore();

    this.drawParticles(ctx);

    ctx.save();
    ctx.translate(monsterPanelOffsetX, 0);
    this.drawHomeMonster(ctx);
    ctx.restore();

    const buttonWidth = 230;
    const buttonHeight = 72;
    const gapX = 20;
    const gapY = 14;

    const rightAreaWidth = buttonWidth * 2 + gapX;
    const rightPadding = 40;

    const col1 = width - rightAreaWidth - rightPadding;
    const col2 = col1 + buttonWidth + gapX;

    const rowHeights: number[] = [];
    for (let i = 0; i < this.buttons.length; i += 2) {
      rowHeights.push(buttonHeight);
    }

    const gridHeight =
      rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0) +
      gapY * (rowHeights.length - 1);

    let startY = (height - gridHeight) / 2 - 20;
    let currentY = startY;

    for (let row = 0; row < rowHeights.length; row++) {
      const leftIndex = row * 2;
      const rightIndex = leftIndex + 1;

      const leftButton = this.buttons[leftIndex];
      const rightButton = this.buttons[rightIndex];
      const rowDelay = row * 0.1;
      const rowProgress = this.easeOutBack(
        this.clamp((this.introTimer - (0.32 + rowDelay)) / 0.46, 0, 1)
      );
      const rowOffsetY = (1 - rowProgress) * -80;

      if (leftButton) {
        leftButton.width = buttonWidth;
        leftButton.height = buttonHeight;
        leftButton.x = col1;
        leftButton.y = currentY;

        ctx.save();
        ctx.translate(0, rowOffsetY);
        this.drawButton(ctx, leftButton);
        ctx.restore();
      }

      if (rightButton) {
        rightButton.width = buttonWidth;
        rightButton.height = buttonHeight;
        rightButton.x = col2;
        rightButton.y = currentY;

        ctx.save();
        ctx.translate(0, rowOffsetY);
        this.drawButton(ctx, rightButton);
        ctx.restore();
      }

      currentY += rowHeights[row] + gapY;
    }

    this.drawMonsterPicker(ctx);
    this.drawSummonTransitionOverlay(ctx);
    this.drawCampaignTransitionOverlay(ctx);  
    this.drawKonjureTransitionOverlay(ctx);

    this.drawCenteredPixelText(
      ctx,
      "KAMIKARP STUDIOS ORIGINAL  V0.1 BETA",
      width / 2,
      height - 14,
      "rgba(255,255,255,0.7)",
      12
    );

    ctx.restore();

    if (fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
