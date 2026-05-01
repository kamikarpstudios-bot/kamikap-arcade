import { StateManager } from "../systems/StateManager";
import { HomeHub } from "./HomeHub";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { TeamSetupScreen } from "./TeamSetupScreen";
import { drawMonster } from "../Monsters/drawMonster";
import { BattleScreen } from "./BattleScreen";

type CampaignButton = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

export class CampaignScreen {
  manager: StateManager;
  introStripeX: number | null = null;

  mouseX = 0;
  mouseY = 0;
  time = 0;
  introActive = true;
  introTimer = 0;
  introDuration = 1.28;
  noticeText = "";
  noticeTimer = 0;
  noticeDuration = 2.4;

  backButton: CampaignButton = {
    label: "BACK",
    x: 36,
    y: 28,
    width: 118,
    height: 42,
    hovered: false,
  };

  quickBattleButton: CampaignButton = {
    label: "QUICK BATTLE",
    x: 0,
    y: 0,
    width: 360,
    height: 88,
    hovered: false,
  };

  storyModeButton: CampaignButton = {
    label: "STORY MODE",
    x: 0,
    y: 0,
    width: 360,
    height: 88,
    hovered: false,
  };

  teamSetupButton: CampaignButton = {
    label: "TEAM SETUP",
    x: 0,
    y: 0,
    width: 240,
    height: 50,
    hovered: false,
  };

  teamSlots: (keyof typeof monsterRegistry | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
  ];
constructor(
  manager: StateManager,
  options?: {
    introStripeX?: number;
  }
) {
  this.manager = manager;
  this.teamSlots = this.manager.getTeamSlots();
  this.introStripeX = options?.introStripeX ?? null;

  window.addEventListener("mousemove", this.handleMouseMove);
  window.addEventListener("click", this.handleClick);
}

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
  }

  private updateLayout(canvas: HTMLCanvasElement) {
    const { width } = canvas;

    const leftPanelX = 54;
    const mainBoardWidth = 420;

    this.quickBattleButton.x = leftPanelX + 28;
    this.quickBattleButton.y = 178;

    this.storyModeButton.x = leftPanelX + 28;
    this.storyModeButton.y = 286;

    this.teamSetupButton.x = leftPanelX + 88;
    this.teamSetupButton.y = 410;

    this.quickBattleButton.width = mainBoardWidth - 56;
    this.storyModeButton.width = mainBoardWidth - 56;
  }

  private isPointInButton(button: CampaignButton) {
    return (
      this.mouseX >= button.x &&
      this.mouseX <= button.x + button.width &&
      this.mouseY >= button.y &&
      this.mouseY <= button.y + button.height
    );
  }

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.updateLayout(canvas);

    this.backButton.hovered = this.isPointInButton(this.backButton);
    this.quickBattleButton.hovered = this.isPointInButton(this.quickBattleButton);
    this.storyModeButton.hovered = this.isPointInButton(this.storyModeButton);
    this.teamSetupButton.hovered = this.isPointInButton(this.teamSetupButton);
  };

  handleClick = () => {
    if (this.introActive) return;

    if (this.backButton.hovered) {
      this.destroy();
      this.manager.setState(new HomeHub(this.manager));
      return;
    }

    if (this.quickBattleButton.hovered) {
      const hasMonster = this.teamSlots.some((m) => m !== null);

      if (!hasMonster) {
        this.noticeText = "ADD A MONSTER TO YOUR TEAM FIRST";
        this.noticeTimer = this.noticeDuration;
        return;
      }

      const enemyIds = Object.keys(monsterRegistry) as (keyof typeof monsterRegistry)[];
      const randomEnemy =
        enemyIds[Math.floor(Math.random() * enemyIds.length)];

      this.destroy();
      this.manager.setState(
        new BattleScreen(this.manager, [...this.teamSlots], randomEnemy)
      );
      return;
    }

    if (this.storyModeButton.hovered) {
      console.log("Story Mode clicked");
      return;
    }

 if (this.teamSetupButton.hovered) {
  this.destroy();
  this.manager.setState(new TeamSetupScreen(this.manager));
  return;
}
  };

  update() {
    this.time += 0.016;

    if (this.introActive) {
      this.introTimer += 0.016;
      if (this.introTimer >= this.introDuration) {
        this.introTimer = this.introDuration;
        this.introActive = false;
      }
    }

    if (this.noticeTimer > 0) {
      this.noticeTimer = Math.max(0, this.noticeTimer - 0.016);
    }
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

  private drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
}

private drawInsetPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  outer = "#3d2415",
  mid = "#6b4428",
  inner = "#9b6a43",
  darkEdge = "#25150b"
) {
  // outer drop border
  this.drawPixelRect(ctx, x, y, width, height, "#120a05");

  // thick dark frame
  this.drawPixelRect(ctx, x + 2, y + 2, width - 4, height - 4, darkEdge);

  // main wood frame
  this.drawPixelRect(ctx, x + 6, y + 6, width - 12, height - 12, outer);

  // bevel highlight (top/left)
  this.drawPixelRect(ctx, x + 6, y + 6, width - 12, 4, "#8e6342");
  this.drawPixelRect(ctx, x + 6, y + 10, 4, height - 16, "#8e6342");

  // bevel shadow (bottom/right)
  this.drawPixelRect(ctx, x + 10, y + height - 10, width - 16, 4, "#2a170c");
  this.drawPixelRect(ctx, x + width - 10, y + 10, 4, height - 16, "#2a170c");

  // mid body
  this.drawPixelRect(ctx, x + 12, y + 12, width - 24, height - 24, mid);

  // inner panel
  this.drawPixelRect(ctx, x + 18, y + 18, width - 36, height - 36, inner);

  // top inner shine
  this.drawPixelRect(ctx, x + 18, y + 18, width - 36, 4, "rgba(255,240,210,0.14)");

  // inner bottom shade
  this.drawPixelRect(
    ctx,
    x + 18,
    y + height - 22,
    width - 36,
    4,
    "rgba(0,0,0,0.18)"
  );

  // subtle wood planks / grain bands
  for (let i = 0; i < 7; i++) {
    const stripeY = y + 28 + i * 18;
    if (stripeY < y + height - 26) {
      this.drawPixelRect(
        ctx,
        x + 22,
        stripeY,
        width - 44,
        2,
        "rgba(255,255,255,0.05)"
      );
      this.drawPixelRect(
        ctx,
        x + 22,
        stripeY + 2,
        width - 44,
        2,
        "rgba(0,0,0,0.06)"
      );
    }
  }

  // corner bolts
  const boltColor = "#d6b078";
  const boltShadow = "#6a4527";

  const drawBolt = (bx: number, by: number) => {
    this.drawPixelRect(ctx, bx, by, 8, 8, boltShadow);
    this.drawPixelRect(ctx, bx + 2, by + 2, 4, 4, boltColor);
    this.drawPixelRect(ctx, bx + 2, by + 2, 4, 1, "#f7dfb2");
  };

  drawBolt(x + 12, y + 12);
  drawBolt(x + width - 20, y + 12);
  drawBolt(x + 12, y + height - 20);
  drawBolt(x + width - 20, y + height - 20);
}

  private drawMetalPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // outer edge (deep shadow)
  this.drawPixelRect(ctx, x, y, width, height, "#12161d");

  // main frame
  this.drawPixelRect(ctx, x + 2, y + 2, width - 4, height - 4, "#29313e");

  // bevel highlight (top/left)
  this.drawPixelRect(ctx, x + 2, y + 2, width - 4, 3, "#6f7f97");
  this.drawPixelRect(ctx, x + 2, y + 5, 3, height - 7, "#6f7f97");

  // bevel shadow (bottom/right)
  this.drawPixelRect(ctx, x + 5, y + height - 5, width - 7, 3, "#1a202a");
  this.drawPixelRect(ctx, x + width - 5, y + 5, 3, height - 7, "#1a202a");

  // inner plate
  this.drawPixelRect(ctx, x + 6, y + 6, width - 12, height - 12, "#465266");

  // inner lip (adds depth)
  this.drawPixelRect(ctx, x + 10, y + 10, width - 20, height - 20, "#5f6b7c");

  // highlight strip (metal shine)
  this.drawPixelRect(
    ctx,
    x + 10,
    y + 10,
    width - 20,
    4,
    "rgba(220,235,255,0.25)"
  );

  // subtle bottom shade
  this.drawPixelRect(
    ctx,
    x + 10,
    y + height - 14,
    width - 20,
    3,
    "rgba(0,0,0,0.25)"
  );

  // rivets (corners)
  const rivetOuter = "#1c222c";
  const rivetInner = "#aeb8c6";

  const rivet = (rx: number, ry: number) => {
    this.drawPixelRect(ctx, rx, ry, 6, 6, rivetOuter);
    this.drawPixelRect(ctx, rx + 1, ry + 1, 4, 4, rivetInner);
    this.drawPixelRect(ctx, rx + 1, ry + 1, 4, 1, "#ffffff");
  };

  rivet(x + 8, y + 8);
  rivet(x + width - 14, y + 8);
  rivet(x + 8, y + height - 14);
  rivet(x + width - 14, y + height - 14);
}

  private drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 20,
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const px = Math.round(x);
  const py = Math.round(y);

  // --------------------------------
  // 1. Deep shadow (anchor text)
  // --------------------------------
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText(text, px + 2, py + 2);

  // --------------------------------
  // 2. Soft outer glow (readability)
  // --------------------------------
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillText(text, px - 1, py);
  ctx.fillText(text, px + 1, py);
  ctx.fillText(text, px, py - 1);
  ctx.fillText(text, px, py + 1);

  // --------------------------------
  // 3. Main text
  // --------------------------------
  ctx.fillStyle = color;
  ctx.fillText(text, px, py);

  // --------------------------------
  // 4. Top highlight (pixel bevel feel)
  // --------------------------------
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText(text, px, py - 1);

  ctx.restore();
}

  private drawVillageBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const horizonY = Math.round(height * 0.58);
  const villageY = Math.round(height * 0.6);
  const pathY = height - 112;

  // =========================
  // SKY
  // =========================
  this.drawPixelRect(ctx, 0, 0, width, height, "#7fc7ff");
  this.drawPixelRect(ctx, 0, 0, width, height * 0.10, "#dff4ff");
  this.drawPixelRect(ctx, 0, height * 0.10, width, height * 0.12, "#bfe7ff");
  this.drawPixelRect(ctx, 0, height * 0.22, width, height * 0.12, "#9fd7ff");
  this.drawPixelRect(ctx, 0, height * 0.34, width, height * 0.14, "#84c7f4");
  this.drawPixelRect(ctx, 0, height * 0.48, width, height * 0.10, "#a9d88d");

  // sun glow first
  this.drawPixelRect(ctx, width - 210, 34, 90, 90, "rgba(255,220,120,0.12)");
  this.drawPixelRect(ctx, width - 196, 48, 62, 62, "rgba(255,232,150,0.18)");

  // sun
  this.drawPixelRect(ctx, width - 182, 56, 46, 46, "#ffd84a");
  this.drawPixelRect(ctx, width - 178, 60, 38, 38, "#ffe784");
  this.drawPixelRect(ctx, width - 172, 54, 6, 50, "rgba(255,250,210,0.22)");
  this.drawPixelRect(ctx, width - 188, 72, 58, 8, "rgba(255,250,210,0.18)");

  // =========================
  // CLOUDS
  // =========================
  const cloud = (x: number, y: number, w: number) => {
    this.drawPixelRect(ctx, x, y + 10, w, 16, "#f8fdff");
    this.drawPixelRect(ctx, x + 14, y + 2, w * 0.34, 16, "#ffffff");
    this.drawPixelRect(ctx, x + 38, y - 4, w * 0.28, 18, "#ffffff");
    this.drawPixelRect(ctx, x + 62, y + 4, w * 0.28, 16, "#ffffff");
    this.drawPixelRect(ctx, x + 8, y + 24, w - 16, 8, "#d7efff");
    this.drawPixelRect(ctx, x + 18, y + 8, w - 36, 4, "rgba(255,255,255,0.25)");
  };

  cloud(74, 70, 112);
  cloud(280, 94, 104);
  cloud(506, 78, 126);

  // =========================
  // FAR MOUNTAIN BAND
  // =========================
  this.drawPixelRect(ctx, 0, height * 0.34, width, height * 0.19, "#8fa2cf");

  for (let i = -40; i < width + 80; i += 120) {
    ctx.fillStyle = "#7388b4";
    ctx.beginPath();
    ctx.moveTo(i, height * 0.53);
    ctx.lineTo(i + 58, height * 0.37);
    ctx.lineTo(i + 122, height * 0.53);
    ctx.fill();

    ctx.fillStyle = "#6679a0";
    ctx.beginPath();
    ctx.moveTo(i + 52, height * 0.53);
    ctx.lineTo(i + 90, height * 0.42);
    ctx.lineTo(i + 140, height * 0.53);
    ctx.fill();

    ctx.fillStyle = "#e6efff";
    ctx.beginPath();
    ctx.moveTo(i + 46, height * 0.41);
    ctx.lineTo(i + 58, height * 0.37);
    ctx.lineTo(i + 71, height * 0.41);
    ctx.fill();
  }

  // =========================
  // BACK HILLS
  // =========================
  this.drawPixelRect(ctx, 0, height * 0.50, width, 42, "#84b86a");
  this.drawPixelRect(ctx, 0, height * 0.56, width, 44, "#709f56");
  this.drawPixelRect(ctx, 0, horizonY - 6, width, 12, "#5d8747");

  // =========================
  // TREE LINE
  // =========================
  for (let i = 0; i < width; i += 72) {
    const tx = i + ((i / 72) % 2) * 8;
    const ty = height * 0.53 + ((i / 72) % 3) * 3;

    // trunk
    this.drawPixelRect(ctx, tx + 18, ty + 22, 10, 24, "#6b4326");
    this.drawPixelRect(ctx, tx + 20, ty + 22, 2, 24, "#8a5a34");

    // canopy
    this.drawPixelRect(ctx, tx, ty + 10, 46, 16, "#2a6535");
    this.drawPixelRect(ctx, tx + 6, ty, 34, 14, "#3d8b49");
    this.drawPixelRect(ctx, tx + 12, ty + 18, 24, 10, "#224f2a");

    // little leaf highlight
    this.drawPixelRect(ctx, tx + 10, ty + 4, 10, 3, "#67b56f");
    this.drawPixelRect(ctx, tx + 24, ty + 7, 8, 2, "#67b56f");
  }

  // =========================
  // VILLAGE STRIP
  // =========================
  this.drawPixelRect(ctx, 0, villageY, width, 98, "#71b75f");
  this.drawPixelRect(ctx, 0, villageY + 54, width, 22, "#5b9448");

  const drawHouse = (
    x: number,
    y: number,
    w: number,
    h: number,
    body: string
  ) => {
    // roof shadow
    this.drawPixelRect(ctx, x - 8, y - 18, w + 16, 18, "#5a2f1a");
    this.drawPixelRect(ctx, x - 4, y - 14, w + 8, 12, "#8f4f30");
    this.drawPixelRect(ctx, x, y, w, h, body);

    // wall shade
    this.drawPixelRect(ctx, x + w - 10, y, 10, h, "rgba(0,0,0,0.10)");

    // door
    this.drawPixelRect(ctx, x + 10, y + h - 28, 18, 28, "#5f341c");
    this.drawPixelRect(ctx, x + 13, y + h - 24, 4, 20, "#7f4d28");

    // windows
    this.drawPixelRect(ctx, x + w - 32, y + 18, 14, 16, "#dff5ff");
    this.drawPixelRect(ctx, x + w - 14, y + 18, 10, 16, "#dff5ff");
    this.drawPixelRect(ctx, x + w - 32, y + 18, 2, 16, "#8aa9c0");
    this.drawPixelRect(ctx, x + w - 14, y + 18, 2, 16, "#8aa9c0");

    // sunlight edge
    this.drawPixelRect(ctx, x + 4, y + 4, w - 14, 3, "rgba(255,245,210,0.10)");
  };

  drawHouse(86, villageY + 10, 72, 58, "#d8b072");
  drawHouse(196, villageY + 4, 88, 64, "#c99562");
  drawHouse(326, villageY + 12, 78, 56, "#ddb984");
  drawHouse(450, villageY + 8, 84, 60, "#c88f56");

  // =========================
  // FOREGROUND GROUND
  // =========================
  this.drawPixelRect(ctx, 0, height - 132, width, 132, "#5b8d42");
  this.drawPixelRect(ctx, 0, height - 96, width, 96, "#476f34");
  this.drawPixelRect(ctx, 0, height - 48, width, 48, "#395728");

  // =========================
  // MAIN PATH
  // =========================
  this.drawPixelRect(ctx, 0, pathY, width, 42, "#caa36a");
  this.drawPixelRect(ctx, 0, pathY + 20, width, 12, "#b58e59");
  this.drawPixelRect(ctx, 0, pathY + 34, width, 8, "#d7b37a");

  // subtle path breakup
  for (let i = 0; i < width; i += 64) {
    this.drawPixelRect(ctx, i + 10, pathY + 8, 18, 4, "rgba(255,235,190,0.18)");
    this.drawPixelRect(ctx, i + 36, pathY + 24, 14, 3, "rgba(0,0,0,0.08)");
  }

  // =========================
  // FOREGROUND SHADE FOR UI READABILITY
  // =========================
  this.drawPixelRect(ctx, 0, 94, width, height - 94, "rgba(0,0,0,0.04)");
}
  private drawBoardHeader(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  title: string,
  subtitle?: string
) {
  const plateX = x + 18;
  const plateY = y - 24;
  const plateW = width - 36;
  const plateH = subtitle ? 52 : 36;

  // main metal plate (bigger + more presence)
  this.drawMetalPlate(ctx, plateX, plateY, plateW, plateH);

  // inner highlight strip (top)
  this.drawPixelRect(
    ctx,
    plateX + 10,
    plateY + 10,
    plateW - 20,
    3,
    "rgba(255,255,255,0.18)"
  );

  // subtle bottom shade
  this.drawPixelRect(
    ctx,
    plateX + 10,
    plateY + plateH - 12,
    plateW - 20,
    3,
    "rgba(0,0,0,0.2)"
  );

  // =========================
  // TITLE (centered in plate)
  // =========================
  const titleY = subtitle ? plateY + 18 : plateY + plateH / 2;

  this.drawPixelText(
    ctx,
    title,
    plateX + plateW / 2,
    titleY,
    "#fff4d6",
    18,
    "center"
  );

  // =========================
  // SUBTITLE (inside plate now)
  // =========================
  if (subtitle) {
    this.drawPixelText(
      ctx,
      subtitle,
      plateX + plateW / 2,
      plateY + 36,
      "#e6cfa3",
      11,
      "center"
    );
  }

  // =========================
  // SIDE BRACKETS (huge polish)
  // =========================
  const bracketW = 10;
  const bracketH = 22;

  const drawBracket = (bx: number, by: number) => {
    this.drawPixelRect(ctx, bx, by, bracketW, bracketH, "#1b1108");
    this.drawPixelRect(ctx, bx + 2, by + 2, bracketW - 4, bracketH - 4, "#6d4427");
    this.drawPixelRect(ctx, bx + 4, by + 4, bracketW - 8, bracketH - 8, "#a06b2f");
  };

  drawBracket(plateX - 6, plateY + 6);
  drawBracket(plateX + plateW - 4, plateY + 6);
}

  private drawButton(
  ctx: CanvasRenderingContext2D,
  button: CampaignButton,
  baseColor: string,
  innerColor: string,
  hoverInner: string
) {
  const isHovered = button.hovered;
  const outer = "#1a0f08";
  const frame = baseColor;
  const inner = isHovered ? hoverInner : innerColor;

  const lift = isHovered ? -2 : 0;
  const glowAlpha = isHovered ? 0.18 : 0.08;

  const x = Math.round(button.x);
  const y = Math.round(button.y + lift);
  const w = Math.round(button.width);
  const h = Math.round(button.height);

  // soft shadow under button
  this.drawPixelRect(ctx, x + 4, y + h - 2, w - 8, 6, "rgba(0,0,0,0.22)");

  // outer silhouette
  this.drawPixelRect(ctx, x, y, w, h, outer);

  // frame
  this.drawPixelRect(ctx, x + 2, y + 2, w - 4, h - 4, frame);

  // top/left bevel
  this.drawPixelRect(ctx, x + 2, y + 2, w - 4, 3, "rgba(255,240,210,0.18)");
  this.drawPixelRect(ctx, x + 2, y + 5, 3, h - 7, "rgba(255,240,210,0.14)");

  // bottom/right bevel
  this.drawPixelRect(ctx, x + 5, y + h - 5, w - 7, 3, "rgba(0,0,0,0.22)");
  this.drawPixelRect(ctx, x + w - 5, y + 5, 3, h - 7, "rgba(0,0,0,0.22)");

  // main face
  this.drawPixelRect(ctx, x + 8, y + 8, w - 16, h - 16, inner);

  // inner top shine
  this.drawPixelRect(ctx, x + 8, y + 8, w - 16, 4, "rgba(255,255,255,0.14)");

  // subtle lower band
  this.drawPixelRect(ctx, x + 8, y + h - 14, w - 16, 4, "rgba(0,0,0,0.10)");

  // hover glow in center
  if (isHovered) {
    this.drawPixelRect(
      ctx,
      x + 14,
      y + 14,
      w - 28,
      h - 28,
      `rgba(255,255,255,${glowAlpha})`
    );
  }

  // small corner studs
  const studColor = "rgba(255,245,220,0.18)";
  this.drawPixelRect(ctx, x + 10, y + 10, 4, 4, studColor);
  this.drawPixelRect(ctx, x + w - 14, y + 10, 4, 4, studColor);
  this.drawPixelRect(ctx, x + 10, y + h - 14, 4, 4, "rgba(0,0,0,0.12)");
  this.drawPixelRect(ctx, x + w - 14, y + h - 14, 4, 4, "rgba(0,0,0,0.12)");

  // label
  this.drawPixelText(
    ctx,
    button.label,
    x + w / 2,
    y + h / 2 + (isHovered ? -1 : 1),
    "#fff6d6",
    20,
    "center"
  );
}
  private drawTeamSlot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  slotIndex: number,
  monsterId: keyof typeof monsterRegistry | null
) {
  const px = Math.round(x);
  const py = Math.round(y);
  const w = Math.round(width);
  const h = Math.round(height);

  // =========================
  // OUTER SLOT FRAME
  // =========================
  this.drawPixelRect(ctx, px, py, w, h, "#160d07");
  this.drawPixelRect(ctx, px + 2, py + 2, w - 4, h - 4, "#2d1a0f");
  this.drawPixelRect(ctx, px + 6, py + 6, w - 12, h - 12, "#4c301d");

  // bevel light
  this.drawPixelRect(ctx, px + 6, py + 6, w - 12, 3, "#8d6544");
  this.drawPixelRect(ctx, px + 6, py + 9, 3, h - 15, "#8d6544");

  // bevel dark
  this.drawPixelRect(ctx, px + 9, py + h - 9, w - 15, 3, "#23140b");
  this.drawPixelRect(ctx, px + w - 9, py + 9, 3, h - 15, "#23140b");

  // =========================
  // INNER DISPLAY AREA
  // =========================
  const displayX = px + 10;
  const displayY = py + 10;
  const displayW = w - 20;
  const displayH = 82;

  this.drawPixelRect(ctx, displayX, displayY, displayW, displayH, "#734c31");
  this.drawPixelRect(ctx, displayX + 4, displayY + 4, displayW - 8, displayH - 8, "#9a6a45");

  // upper light wash
  this.drawPixelRect(
    ctx,
    displayX + 4,
    displayY + 4,
    displayW - 8,
    4,
    "rgba(255,240,210,0.10)"
  );

  // backdrop band behind monster
  this.drawPixelRect(ctx, displayX + 6, displayY + 10, displayW - 12, 26, "#2b2bd2");
  this.drawPixelRect(ctx, displayX + 6, displayY + 36, displayW - 12, 18, "#5269de");

  // =========================
  // PEDESTAL
  // =========================
  const pedestalW = w - 36;
  const pedestalH = 54;
  const pedestalX = px + 18;
  const pedestalY = py + h - pedestalH - 16;

  // pedestal shadow
  this.drawPixelRect(
    ctx,
    pedestalX + 6,
    pedestalY + 34,
    pedestalW - 12,
    8,
    "rgba(0,0,0,0.18)"
  );

  // pedestal base
  this.drawPixelRect(ctx, pedestalX, pedestalY + 24, pedestalW, 16, "#5f6773");
  this.drawPixelRect(ctx, pedestalX + 2, pedestalY + 26, pedestalW - 4, 6, "#737d89");

  // pedestal mid
  this.drawPixelRect(ctx, pedestalX + 10, pedestalY + 14, pedestalW - 20, 10, "#8b95a3");
  this.drawPixelRect(ctx, pedestalX + 14, pedestalY + 16, pedestalW - 28, 3, "#d3d9e0");

  // pedestal top
  this.drawPixelRect(ctx, pedestalX + 18, pedestalY + 8, pedestalW - 36, 6, "#bbc4cd");
  this.drawPixelRect(ctx, pedestalX + 22, pedestalY + 8, pedestalW - 44, 2, "#eef3f8");

  // =========================
  // NAMEPLATE AREA
  // =========================
  const namePlateX = px + 12;
  const namePlateY = py + h - 34;
  const namePlateW = w - 24;
  const namePlateH = 18;

  this.drawPixelRect(ctx, namePlateX, namePlateY, namePlateW, namePlateH, "#3a2415");
  this.drawPixelRect(ctx, namePlateX + 2, namePlateY + 2, namePlateW - 4, namePlateH - 4, "#5c3922");
  this.drawPixelRect(
    ctx,
    namePlateX + 2,
    namePlateY + 2,
    namePlateW - 4,
    2,
    "rgba(255,255,255,0.08)"
  );

  if (monsterId) {
    const monster = monsterRegistry[monsterId];

    ctx.save();
    ctx.beginPath();
    ctx.rect(displayX + 2, displayY + 2, displayW - 4, displayH - 4);
    ctx.clip();

    const desiredHeight = 92;
    const scale = desiredHeight / monster.baseHeight;
    const monsterBaseY = pedestalY - 30;

    // subtle chamber glow behind monster
    this.drawPixelRect(
      ctx,
      px + Math.floor(w / 2) - 24,
      displayY + 12,
      48,
      34,
      "rgba(255,245,210,0.08)"
    );

    ctx.translate(px + w / 2, monsterBaseY);
    ctx.scale(scale, scale);

    drawMonster(monster, {
      ctx,
      x: 0,
      y: 0,
      time: this.time,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      state: "HOME",
    });

    ctx.restore();

    this.drawPixelText(
      ctx,
      monster.name.toUpperCase(),
      px + w / 2,
      py + h - 25,
      "#fff2c8",
      10,
      "center"
    );

    this.drawPixelText(
      ctx,
      `SLOT ${slotIndex + 1}`,
      px + w / 2,
      py + h - 10,
      "#d9bf92",
      9,
      "center"
    );
  } else {
    // empty slot chamber marker
    this.drawPixelRect(ctx, px + w / 2 - 18, displayY + 26, 36, 20, "#6f4a2f");
    this.drawPixelRect(ctx, px + w / 2 - 12, displayY + 18, 24, 10, "#8f6543");
    this.drawPixelRect(ctx, px + w / 2 - 8, displayY + 34, 16, 3, "#d9bf92");

    this.drawPixelText(
      ctx,
      "EMPTY",
      px + w / 2,
      py + h - 25,
      "#e2c79a",
      11,
      "center"
    );

    this.drawPixelText(
      ctx,
      `SLOT ${slotIndex + 1}`,
      px + w / 2,
      py + h - 10,
      "#d9bf92",
      9,
      "center"
    );
  }

  // tiny corner studs
  this.drawPixelRect(ctx, px + 8, py + 8, 4, 4, "rgba(255,230,190,0.16)");
  this.drawPixelRect(ctx, px + w - 12, py + 8, 4, 4, "rgba(255,230,190,0.16)");
  this.drawPixelRect(ctx, px + 8, py + h - 12, 4, 4, "rgba(0,0,0,0.16)");
  this.drawPixelRect(ctx, px + w - 12, py + h - 12, 4, 4, "rgba(0,0,0,0.16)");
}

  private drawTeamPanel(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const panelWidth = 392;
  const panelHeight = 446;
  const panelX = width - panelWidth - 44;
  const panelY = 118;

  this.drawInsetPanel(ctx, panelX, panelY, panelWidth, panelHeight);
  this.drawBoardHeader(
    ctx,
    panelX,
    panelY + 18,
    panelWidth,
    "DISPLAYED TEAM",
    "ACTIVE KINS"
  );

  // inner chamber behind the whole grid
  const chamberX = panelX + 18;
  const chamberY = panelY + 58;
  const chamberW = panelWidth - 36;
  const chamberH = panelHeight - 78;

  this.drawPixelRect(ctx, chamberX, chamberY, chamberW, chamberH, "#76511e");
  this.drawPixelRect(ctx, chamberX + 3, chamberY + 3, chamberW - 6, chamberH - 6, "#855315");
  this.drawPixelRect(ctx, chamberX + 8, chamberY + 8, chamberW - 16, chamberH - 16, "#7a4a1d");

  // top inner highlight
  this.drawPixelRect(
    ctx,
    chamberX + 8,
    chamberY + 8,
    chamberW - 16,
    3,
    "rgba(105, 114, 220, 0.08)"
  );

  // bottom shade
  this.drawPixelRect(
    ctx,
    chamberX + 8,
    chamberY + chamberH - 11,
    chamberW - 16,
    3,
    "rgba(55, 26, 182, 0.14)"
  );

  // small divider title
  this.drawPixelText(
    ctx,
    "CURRENT PARTY",
    panelX + panelWidth / 2,
    panelY + 74,
    "#f2ddb8",
    10,
    "center"
  );

  const innerPadding = 28;
  const cols = 2;
  const slotGapX = 14;
  const slotGapY = 14;
  const contentTop = panelY + 88;
  const slotWidth = (panelWidth - innerPadding * 2 - slotGapX) / cols;
  const slotHeight = 108;

  for (let i = 0; i < this.teamSlots.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const slotX = panelX + innerPadding + col * (slotWidth + slotGapX);
    const slotY = contentTop + row * (slotHeight + slotGapY);

    this.drawTeamSlot(
      ctx,
      slotX,
      slotY,
      slotWidth,
      slotHeight,
      i,
      this.teamSlots[i]
    );
  }

  // footer status strip
  const readyCount = this.teamSlots.filter((m) => m !== null).length;
  const footerY = panelY + panelHeight - 24;

  this.drawPixelRect(ctx, panelX + 26, footerY, panelWidth - 52, 12, "#4a2d1b");
  this.drawPixelRect(ctx, panelX + 28, footerY + 2, panelWidth - 56, 8, "#6a4228");

  this.drawPixelText(
    ctx,
    `${readyCount}/6 READY`,
    panelX + panelWidth / 2,
    footerY + 6,
    readyCount > 0 ? "#dff2c2" : "#e5c8a0",
    9,
    "center"
  );
}
  private drawMainPanel(ctx: CanvasRenderingContext2D) {
  const x = 54;
  const y = 112;
  const width = 420;
  const height = 388;

  this.drawInsetPanel(ctx, x, y, width, height);
  this.drawBoardHeader(
    ctx,
    x,
    y + 18,
    width,
    "CAMPAIGN",
    "CHOOSE HOW YOU WANT TO PLAY"
  );

  // inner content chamber
  const chamberX = x + 20;
  const chamberY = y + 58;
  const chamberW = width - 40;
  const chamberH = height - 80;

  this.drawPixelRect(ctx, chamberX, chamberY, chamberW, chamberH, "#3b2414");
  this.drawPixelRect(ctx, chamberX + 3, chamberY + 3, chamberW - 6, chamberH - 6, "#5a3822");
  this.drawPixelRect(ctx, chamberX + 8, chamberY + 8, chamberW - 16, chamberH - 16, "#7a5133");

  // top light / bottom shade
  this.drawPixelRect(
    ctx,
    chamberX + 8,
    chamberY + 8,
    chamberW - 16,
    3,
    "rgba(255,240,210,0.08)"
  );
  this.drawPixelRect(
    ctx,
    chamberX + 8,
    chamberY + chamberH - 11,
    chamberW - 16,
    3,
    "rgba(0,0,0,0.14)"
  );

  // title block
  this.drawPixelText(ctx, "BATTLE PATHS", x + width / 2, y + 90, "#fff1c8", 22, "center");
  this.drawPixelText(
    ctx,
    "ENTER THE NEXT CHALLENGE",
    x + width / 2,
    y + 116,
    "#ebd0a3",
    12,
    "center"
  );

  // divider plate
  this.drawPixelRect(ctx, x + 74, y + 132, width - 148, 8, "#4a2d1b");
  this.drawPixelRect(ctx, x + 78, y + 134, width - 156, 4, "#6c4328");

  // section label
  this.drawPixelText(
    ctx,
    "AVAILABLE MODES",
    x + width / 2,
    y + 154,
    "#f0d7ac",
    10,
    "center"
  );

  // buttons
  this.drawButton(ctx, this.quickBattleButton, "#234422", "#3e7a35", "#54a043");
  this.drawButton(ctx, this.storyModeButton, "#2d2d53", "#4951a4", "#5e69cc");
  this.drawButton(ctx, this.teamSetupButton, "#5b3818", "#a06b2f", "#c68439");

  // bottom status strip
  const hasMonster = this.teamSlots.some((m) => m !== null);
  const readyCount = this.teamSlots.filter((m) => m !== null).length;

  const statusX = x + 34;
  const statusY = y + height - 44;
  const statusW = width - 68;
  const statusH = 24;

  this.drawPixelRect(ctx, statusX, statusY, statusW, statusH, "#3d2415");
  this.drawPixelRect(ctx, statusX + 2, statusY + 2, statusW - 4, statusH - 4, "#5f3a21");
  this.drawPixelRect(
    ctx,
    statusX + 2,
    statusY + 2,
    statusW - 4,
    2,
    "rgba(255,255,255,0.08)"
  );

  this.drawPixelText(
    ctx,
    hasMonster
      ? `TEAM READY FOR BATTLE   ${readyCount}/6`
      : "ADD A MONSTER TO START",
    x + width / 2,
    statusY + statusH / 2 + 1,
    hasMonster ? "#dff6c8" : "#ffd3a8",
    11,
    "center"
  );
}
private drawTopBar(ctx: CanvasRenderingContext2D, width: number) {
  const barH = 94;

  // =========================
  // MAIN BAR BODY
  // =========================
  this.drawPixelRect(ctx, 0, 0, width, barH, "#2d1a0f");
  this.drawPixelRect(ctx, 0, 0, width, 10, "#8d603d");
  this.drawPixelRect(ctx, 0, 10, width, 8, "#a97850");
  this.drawPixelRect(ctx, 0, barH - 18, width, 18, "#22130b");

  // inner wood band
  this.drawPixelRect(ctx, 0, 18, width, 54, "#3e2616");
  this.drawPixelRect(ctx, 0, 24, width, 6, "rgba(255,240,210,0.08)");
  this.drawPixelRect(ctx, 0, 64, width, 6, "rgba(0,0,0,0.16)");

  // subtle vertical sectioning
  for (let i = 0; i < width; i += 96) {
    this.drawPixelRect(ctx, i, 20, 2, 50, "rgba(255,255,255,0.03)");
    this.drawPixelRect(ctx, i + 48, 20, 2, 50, "rgba(0,0,0,0.05)");
  }

  // =========================
  // CENTER CREST / TITLE AREA
  // =========================
  const plateW = 320;
  const plateH = 40;
  const plateX = Math.round(width / 2 - plateW / 2);
  const plateY = 14;

  // backing bracket behind title plate
  this.drawPixelRect(ctx, plateX - 18, plateY + 8, 18, 20, "#20130b");
  this.drawPixelRect(ctx, plateX + plateW, plateY + 8, 18, 20, "#20130b");
  this.drawPixelRect(ctx, plateX - 14, plateY + 10, 10, 16, "#6c4328");
  this.drawPixelRect(ctx, plateX + plateW + 4, plateY + 10, 10, 16, "#6c4328");

  this.drawMetalPlate(ctx, plateX, plateY, plateW, plateH);

  // tiny top shine on plate
  this.drawPixelRect(
    ctx,
    plateX + 12,
    plateY + 10,
    plateW - 24,
    3,
    "rgba(255,255,255,0.14)"
  );

  this.drawPixelText(ctx, "CAMPAIGN HALL", width / 2, 34, "#fff1c8", 24, "center");
  this.drawPixelText(ctx, "KAMIKARP STUDIOS", width / 2, 60, "#ebd0a3", 11, "center");

  // =========================
  // BACK BUTTON ZONE
  // =========================
  const padX = this.backButton.x - 10;
  const padY = this.backButton.y - 8;
  const padW = this.backButton.width + 20;
  const padH = this.backButton.height + 16;

  this.drawPixelRect(ctx, padX, padY, padW, padH, "#24150c");
  this.drawPixelRect(ctx, padX + 2, padY + 2, padW - 4, padH - 4, "#4a2d1b");
  this.drawPixelRect(
    ctx,
    padX + 2,
    padY + 2,
    padW - 4,
    3,
    "rgba(255,255,255,0.06)"
  );

  this.drawButton(ctx, this.backButton, "#402615", "#6d4427", "#8a5831");

  // =========================
  // LOWER EDGE / SEPARATOR
  // =========================
  this.drawPixelRect(ctx, 0, barH - 4, width, 4, "#120a06");
}

  private drawNotice(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (this.noticeTimer <= 0 || !this.noticeText) return;

    const noticeT = this.clamp(this.noticeTimer / this.noticeDuration, 0, 1);
    const alpha = Math.min(1, noticeT * 2.2);
    const noticeW = 430;
    const noticeH = 74;
    const noticeX = Math.round(width / 2 - noticeW / 2);
    const noticeY = Math.round(height - 124 - (1 - alpha) * 10);

    ctx.save();
    ctx.globalAlpha = alpha;

    this.drawPixelRect(ctx, noticeX + 8, noticeY + noticeH - 4, noticeW - 16, 10, "rgba(0,0,0,0.24)");
    this.drawInsetPanel(
      ctx,
      noticeX,
      noticeY,
      noticeW,
      noticeH,
      "#5a2418",
      "#8d3e2d",
      "#b4543a",
      "#241008"
    );
    this.drawPixelRect(ctx, noticeX + 18, noticeY + 16, noticeW - 36, 10, "#f0b36d");
    this.drawPixelRect(ctx, noticeX + 18, noticeY + 26, noticeW - 36, 4, "#6a2418");

    this.drawPixelText(
      ctx,
      "TEAM REQUIRED",
      width / 2,
      noticeY + 28,
      "#fff2cf",
      12,
      "center"
    );
    this.drawPixelText(
      ctx,
      this.noticeText,
      width / 2,
      noticeY + 50,
      "#ffe0b8",
      10,
      "center"
    );

    ctx.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    const introT = this.clamp(this.introTimer / this.introDuration, 0, 1);
    const cameraSettle = this.easeOutCubic(introT);
    const cameraDropY = (1 - cameraSettle) * -26;
    const topBarProgress = this.easeOutCubic(
      this.clamp((this.introTimer - 0.1) / 0.38, 0, 1)
    );
    const topBarOffsetY = (1 - topBarProgress) * -108;
    const mainPanelProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.2) / 0.52, 0, 1)
    );
    const mainPanelOffsetX = (1 - mainPanelProgress) * -190;
    const teamPanelProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.28) / 0.56, 0, 1)
    );
    const teamPanelOffsetX = (1 - teamPanelProgress) * 210;
    const footerProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.34) / 0.5, 0, 1)
    );
    const footerOffsetY = (1 - footerProgress) * 46;

    const veilT = this.clamp(this.introTimer / 0.62, 0, 1);
    const veilEase = this.easeOutCubic(veilT);
    const sepiaAlpha = (1 - veilEase) * 0.56;
    const bannerHeight = (1 - veilEase) * 60;
    const stripeCollapse = 1 - this.easeOutBack(veilT);
    const stripeW = Math.max(0, 120 * stripeCollapse);

    this.updateLayout(ctx.canvas);

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    ctx.translate(0, cameraDropY);

    this.drawVillageBackground(ctx, width, height);

    // subtle shade behind UI
    this.drawPixelRect(ctx, 0, 94, width, height - 94, "rgba(0,0,0,0.08)");

    ctx.save();
    ctx.translate(0, topBarOffsetY);
    this.drawTopBar(ctx, width);
    ctx.restore();

    ctx.save();
    ctx.translate(mainPanelOffsetX, 0);
    this.drawMainPanel(ctx);
    ctx.restore();

    ctx.save();
    ctx.translate(teamPanelOffsetX, 0);
    this.drawTeamPanel(ctx, width, height);
    ctx.restore();

    ctx.save();
    ctx.translate(0, footerOffsetY);
    this.drawPixelText(
      ctx,
      "ORIGINAL MONSTER ADVENTURE MENU",
      width / 2,
      height - 18,
      "rgba(255,245,220,0.8)",
      11,
      "center"
    );
    this.drawNotice(ctx, width, height);
    ctx.restore();

    ctx.restore();

    if (sepiaAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = sepiaAlpha;
      this.drawPixelRect(ctx, 0, 0, width, height, "#2d1b0e");
      ctx.restore();
    }

    if (bannerHeight > 0.5) {
      this.drawPixelRect(ctx, 0, 0, width, bannerHeight, "#8d5e31");
      this.drawPixelRect(ctx, 0, bannerHeight - 4, width, 4, "#d3a15b");
      this.drawPixelRect(ctx, 0, height - bannerHeight, width, bannerHeight, "#8d5e31");
      this.drawPixelRect(ctx, 0, height - bannerHeight, width, 4, "#d3a15b");
    }

    if (stripeW > 0.5) {
      const stripeWave = Math.sin(this.time * 10) * 8 * stripeCollapse;
      const stripeCenterX = this.introStripeX ?? width / 2;
      const stripeX = stripeCenterX - stripeW / 2 + stripeWave;
      this.drawPixelRect(ctx, stripeX, 0, stripeW, height, "#b13e31");
      this.drawPixelRect(
        ctx,
        stripeCenterX - 4 + stripeWave,
        0,
        8,
        height,
        "#f0d39a"
      );
    }
  }
}
