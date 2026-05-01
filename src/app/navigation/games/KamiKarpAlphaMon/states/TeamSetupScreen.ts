import { StateManager } from "../systems/StateManager";
import { CampaignScreen } from "./CampaignScreen";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { drawMonster } from "../Monsters/drawMonster";

type SimpleButton = {
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

type TeamSlotButton = {
  slotIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

type SummonSlot = {
  monsterId: keyof typeof monsterRegistry | null;
  hovered: boolean;
};

export class TeamSetupScreen {
  manager: StateManager;

  mouseX = 0;
  mouseY = 0;
  time = 0;

  backButton: SimpleButton = {
    x: 28,
    y: 24,
    width: 120,
    height: 48,
    hovered: false,
  };

  clearSlotButton: SimpleButton = {
    x: 0,
    y: 0,
    width: 150,
    height: 38,
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

  selectedSlotIndex = 0;
  selectedSummonIndex = 0;

  summons: SummonSlot[] = [];
  teamSlotButtons: TeamSlotButton[] = [];
  pedestalRects: SimpleButton[] = [];

  topLeftPanel = { x: 24, y: 88, width: 430, height: 336 };
  topRightPanel = { x: 478, y: 88, width: 778, height: 336 };

  gridPanel = {
    x: 24,
    y: 440,
    width: 1232,
    height: 250,
  };

  gridScrollX = 0;
  maxGridScrollX = 0;
  gridTotalCols = 8;
  gridSlotScale = 0.2;

  constructor(manager: StateManager) {
    this.manager = manager;
    this.teamSlots = this.manager.getTeamSlots();

    this.summons = this.createSummonSlots();

    this.teamSlotButtons = Array.from({ length: 6 }, (_, index) => ({
      slotIndex: index,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      hovered: false,
    }));

    this.pedestalRects = Array.from({ length: Math.max(20, this.summons.length) }, () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      hovered: false,
    }));

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("wheel", this.handleWheel);
  }

  private isSelectableMonster(monsterId: keyof typeof monsterRegistry) {
    const id = String(monsterId).toUpperCase();
    return !id.includes("_BACK") && !id.includes("BACK");
  }

  private createSummonSlots(): SummonSlot[] {
    const summoned = this.manager
      .getSummonedMonsterIds()
      .filter((monsterId) => this.isSelectableMonster(monsterId));

    const slots: SummonSlot[] = Array.from(
      { length: Math.max(20, summoned.length) },
      (_, i) => ({
        monsterId: summoned[i] ?? null,
        hovered: false,
      })
    );

    return slots;
  }

  private getSelectedMonsterId(): keyof typeof monsterRegistry | null {
    const teamMonster = this.teamSlots[this.selectedSlotIndex];
    if (teamMonster) return teamMonster;

    return this.summons[this.selectedSummonIndex]?.monsterId ?? null;
  }

  private getSelectedMonster() {
    const id = this.getSelectedMonsterId();
    if (!id) return null;
    return monsterRegistry[id] ?? null;
  }

  private updateLayout() {
    const teamX = this.topLeftPanel.x + 18;
    const teamY = this.topLeftPanel.y + 76;
    const teamW = this.topLeftPanel.width - 36;
    const slotGap = 10;
    const cols = 2;
    const slotW = (teamW - slotGap) / cols;
    const slotH = 82;

    for (let i = 0; i < this.teamSlotButtons.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      this.teamSlotButtons[i].x = teamX + col * (slotW + slotGap);
      this.teamSlotButtons[i].y = teamY + row * (slotH + slotGap);
      this.teamSlotButtons[i].width = slotW;
      this.teamSlotButtons[i].height = slotH;
    }

    this.clearSlotButton.x = this.topLeftPanel.x + 18;
    this.clearSlotButton.y = this.topLeftPanel.y + this.topLeftPanel.height - 54;

    const slotWGrid = 168;
    const slotHGrid = 104;
    const pedestalGapX = 12;
    const pedestalGapY = 14;

    const innerPadLeft = 26;
    const innerPadRight = 26;
    const startX = this.gridPanel.x + innerPadLeft;
    const startY = this.gridPanel.y + 52;

    const availableW = this.gridPanel.width - innerPadLeft - innerPadRight;
    const visibleCols = Math.max(
      1,
      Math.floor((availableW + pedestalGapX) / (slotWGrid + pedestalGapX))
    );

    const totalCols = Math.max(this.gridTotalCols, visibleCols);
    const contentW = totalCols * slotWGrid + (totalCols - 1) * pedestalGapX;
    this.maxGridScrollX = Math.max(0, contentW - availableW);

    if (this.gridScrollX > this.maxGridScrollX) {
      this.gridScrollX = this.maxGridScrollX;
    }

    for (let i = 0; i < this.pedestalRects.length; i++) {
      const col = i % totalCols;
      const row = Math.floor(i / totalCols);

      const rect = this.pedestalRects[i];
      rect.x = startX + col * (slotWGrid + pedestalGapX) - this.gridScrollX;
      rect.y = startY + row * (slotHGrid + pedestalGapY);
      rect.width = slotWGrid;
      rect.height = slotHGrid;
    }
  }

  private isPointInButton(button: SimpleButton) {
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

    this.updateLayout();

    this.backButton.hovered = this.isPointInButton(this.backButton);
    this.clearSlotButton.hovered = this.isPointInButton(this.clearSlotButton);

    this.teamSlotButtons.forEach((button) => {
      button.hovered = this.isPointInButton(button);
    });

    this.pedestalRects.forEach((rect, i) => {
      const summon = this.summons[i];
      const withinGridBounds =
        rect.x + rect.width >= this.gridPanel.x + 8 &&
        rect.x <= this.gridPanel.x + this.gridPanel.width - 8 &&
        rect.y + rect.height >= this.gridPanel.y + 38 &&
        rect.y <= this.gridPanel.y + this.gridPanel.height - 8;

      rect.hovered =
        withinGridBounds &&
        this.isPointInButton(rect) &&
        !!summon?.monsterId;

      if (summon) summon.hovered = rect.hovered;
    });
  };

  handleWheel = (event: WheelEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mx = (event.clientX - rect.left) * scaleX;
    const my = (event.clientY - rect.top) * scaleY;

    const insideGrid =
      mx >= this.gridPanel.x &&
      mx <= this.gridPanel.x + this.gridPanel.width &&
      my >= this.gridPanel.y &&
      my <= this.gridPanel.y + this.gridPanel.height;

    if (!insideGrid) return;

    event.preventDefault();

    this.gridScrollX += event.deltaY + event.deltaX;

    if (this.gridScrollX < 0) this.gridScrollX = 0;
    if (this.gridScrollX > this.maxGridScrollX) {
      this.gridScrollX = this.maxGridScrollX;
    }

    this.updateLayout();
  };

  handleClick = () => {
    if (this.backButton.hovered) {
      this.manager.setTeamSlots(this.teamSlots);
      this.destroy();
      this.manager.setState(new CampaignScreen(this.manager));
      return;
    }

    if (this.clearSlotButton.hovered) {
      this.teamSlots[this.selectedSlotIndex] = null;
      return;
    }

    for (const button of this.teamSlotButtons) {
      if (button.hovered) {
        this.selectedSlotIndex = button.slotIndex;
        return;
      }
    }

    for (let i = 0; i < this.pedestalRects.length; i++) {
      const summon = this.summons[i];
      if (this.pedestalRects[i].hovered && summon?.monsterId) {
        this.selectedSummonIndex = i;

        const existingIndex = this.teamSlots.findIndex(
          (id) => id === summon.monsterId
        );

        if (existingIndex !== -1) {
          this.teamSlots[existingIndex] = null;
        }

        this.teamSlots[this.selectedSlotIndex] = summon.monsterId;
        return;
      }
    }
  };

  update() {
    this.time += 0.016;
    this.updateLayout();
  }

  private snap(n: number) {
    return Math.round(n);
  }

  private drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(this.snap(x), this.snap(y), this.snap(w), this.snap(h));
  }

  private drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#f7edd1",
    size = 16
  ) {
    ctx.save();
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  private drawLeftText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#f7edd1",
    size = 16
  ) {
    ctx.save();
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  private drawSky(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.drawPixelRect(ctx, 0, 0, width, height, "#80c8f8");
    this.drawPixelRect(ctx, 0, height * 0.46, width, height * 0.16, "#99d6fb");
  }

  private drawMountains(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const baseY = height * 0.56;

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
    const baseY = height * 0.62;

    for (let i = -1; i < 18; i++) {
      const x = i * 80;

      this.drawPixelRect(ctx, x + 26, baseY - 34, 10, 34, "#4b331d");
      this.drawPixelRect(ctx, x + 12, baseY - 68, 40, 22, "#2d6a2f");
      this.drawPixelRect(ctx, x + 6, baseY - 50, 52, 20, "#377936");
      this.drawPixelRect(ctx, x + 16, baseY - 86, 32, 20, "#4b9743");
    }
  }

  private drawGround(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const groundY = height * 0.72;

    this.drawPixelRect(ctx, 0, groundY, width, height - groundY, "#cdb48b");
    this.drawPixelRect(ctx, 0, groundY - 12, width, 12, "#5ba24e");

    for (let y = groundY; y < height; y += 34) {
      for (let x = 0; x < width; x += 46) {
        const rowIndex = Math.floor((y - groundY) / 34);
        const offset = rowIndex % 2 === 0 ? 0 : 10;

        ctx.strokeStyle = "rgba(110,80,45,0.22)";
        ctx.strokeRect(this.snap(x + offset), this.snap(y + 2), 36, 24);
      }
    }
  }

  private drawWoodPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    hovered = false
  ) {
    const body = hovered ? "#8f6234" : "#7a522d";
    const dark = "#53351b";
    const light = hovered ? "#c89658" : "#b98045";

    this.drawPixelRect(ctx, x, y, w, h, dark);
    this.drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, body);

    this.drawPixelRect(ctx, x + 4, y + 4, w - 8, 6, light);
    this.drawPixelRect(ctx, x + 4, y + h - 10, w - 8, 6, "#5f3c1d");

    this.drawPixelRect(ctx, x + 10, y + 14, w - 20, 4, "#8e6034");
    this.drawPixelRect(ctx, x + 18, y + 30, w - 36, 4, "#6d4725");
  }

  private drawPixelButton(
    ctx: CanvasRenderingContext2D,
    button: SimpleButton,
    label: string
  ) {
    this.drawWoodPanel(
      ctx,
      button.x,
      button.y,
      button.width,
      button.height,
      button.hovered
    );
    this.drawCenteredText(
      ctx,
      label,
      button.x + button.width / 2,
      button.y + button.height / 2 + 1,
      "#faefcd",
      16
    );
  }

  private drawTeamSlotsPanel(ctx: CanvasRenderingContext2D) {
    this.drawWoodPanel(
      ctx,
      this.topLeftPanel.x,
      this.topLeftPanel.y,
      this.topLeftPanel.width,
      this.topLeftPanel.height,
      false
    );

    this.drawCenteredText(
      ctx,
      "ACTIVE TEAM",
      this.topLeftPanel.x + this.topLeftPanel.width / 2,
      this.topLeftPanel.y + 24,
      "#fff0c7",
      18
    );

    this.teamSlotButtons.forEach((button) => {
      const isSelected = button.slotIndex === this.selectedSlotIndex;
      const monsterId = this.teamSlots[button.slotIndex];

      const border = isSelected ? "#f2d17a" : button.hovered ? "#b4864d" : "#4e3118";
      const inner = isSelected ? "#92662f" : "#6c4927";

      this.drawPixelRect(ctx, button.x, button.y, button.width, button.height, border);
      this.drawPixelRect(ctx, button.x + 4, button.y + 4, button.width - 8, button.height - 8, inner);

      this.drawLeftText(
        ctx,
        `SLOT ${button.slotIndex + 1}`,
        button.x + 14,
        button.y + 18,
        "#fff1cf",
        12
      );

      if (monsterId) {
        const monster = monsterRegistry[monsterId];
        this.drawLeftText(
          ctx,
          monster.name.toUpperCase(),
          button.x + 14,
          button.y + 52,
          "#fff1cf",
          14
        );

        ctx.save();
        ctx.beginPath();
        ctx.rect(button.x + button.width - 76, button.y + 8, 64, 64);
        ctx.clip();

        const scale = 0.12;
        const pedX = button.x + button.width - 44;
        const pedY = button.y + 58;

        this.drawPixelRect(ctx, pedX - 24, pedY, 48, 8, "#7d858f");
        this.drawPixelRect(ctx, pedX - 14, pedY - 6, 28, 6, "#a0a7b0");

        ctx.translate(pedX, pedY - 8);
        ctx.scale(scale, scale);

        drawMonster(monster, {
          ctx,
          x: 0,
          y: 0,
          time: this.time + button.slotIndex * 0.2,
          mouseX: (this.mouseX - pedX) / scale,
          mouseY: (this.mouseY - (pedY - 8)) / scale,
          state: "HOME",
        });

        ctx.restore();
      } else {
        this.drawLeftText(
          ctx,
          "EMPTY",
          button.x + 14,
          button.y + 52,
          "#d7bf97",
          14
        );
      }
    });

    this.drawPixelButton(ctx, this.clearSlotButton, "CLEAR SLOT");
  }

  private drawBigPedestal(ctx: CanvasRenderingContext2D) {
    const panel = this.topRightPanel;
    const monster = this.getSelectedMonster();
    const centerX = panel.x + panel.width / 2;

    const pedestalBaseY = panel.y + panel.height - 54;
    const monsterY = pedestalBaseY - 46;

    this.drawWoodPanel(ctx, panel.x, panel.y, panel.width, panel.height, false);

    this.drawCenteredText(
      ctx,
      "TEAM DISPLAY",
      panel.x + panel.width / 2,
      panel.y + 24,
      "#fff0c7",
      18
    );

    this.drawPixelRect(ctx, centerX - 132, pedestalBaseY - 10, 264, 28, "#6f7781");
    this.drawPixelRect(ctx, centerX - 102, pedestalBaseY - 22, 204, 14, "#8d949d");
    this.drawPixelRect(ctx, centerX - 64, pedestalBaseY - 48, 128, 26, "#aeb5be");

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(centerX, pedestalBaseY + 22, 96, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (monster) {
      const desiredHeight = 250;
      const scale = desiredHeight / monster.baseHeight;

      ctx.save();
      ctx.translate(centerX, monsterY);
      ctx.scale(scale, scale);

      drawMonster(monster, {
        ctx,
        x: 0,
        y: 0,
        time: this.time,
        mouseX: (this.mouseX - centerX) / scale,
        mouseY: (this.mouseY - monsterY) / scale,
        state: "HOME",
      });
      ctx.restore();

      this.drawCenteredText(
        ctx,
        monster.name.toUpperCase(),
        centerX,
        panel.y + 54,
        "#fcefcf",
        18
      );
    } else {
      this.drawCenteredText(
        ctx,
        "NO MONSTER SELECTED",
        centerX,
        panel.y + 150,
        "#fcefcf",
        18
      );
    }
  }

  private drawCollectionGrid(ctx: CanvasRenderingContext2D) {
    this.drawWoodPanel(
      ctx,
      this.gridPanel.x,
      this.gridPanel.y,
      this.gridPanel.width,
      this.gridPanel.height,
      false
    );

    this.drawLeftText(
      ctx,
      "SUMMONED MONSTERS",
      this.gridPanel.x + 20,
      this.gridPanel.y + 24,
      "#fff0c7",
      18
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.gridPanel.x + 8,
      this.gridPanel.y + 38,
      this.gridPanel.width - 16,
      this.gridPanel.height - 54
    );
    ctx.clip();

    for (let i = 0; i < this.pedestalRects.length; i++) {
      const rect = this.pedestalRects[i];
      const summon = this.summons[i];
      const selected = i === this.selectedSummonIndex;

      if (
        rect.x + rect.width < this.gridPanel.x + 8 ||
        rect.x > this.gridPanel.x + this.gridPanel.width - 8
      ) {
        continue;
      }

      const outer = selected
        ? "#f2d17a"
        : summon?.hovered
        ? "#b4864d"
        : "#4e3118";
      const inner = selected ? "#92662f" : "#6c4927";

      this.drawPixelRect(ctx, rect.x, rect.y, rect.width, rect.height, outer);
      this.drawPixelRect(
        ctx,
        rect.x + 4,
        rect.y + 4,
        rect.width - 8,
        rect.height - 8,
        inner
      );

      const pedCenterX = rect.x + rect.width / 2;
      const pedTopY = rect.y + rect.height - 24;
      const monsterY = pedTopY - 10;

      this.drawPixelRect(ctx, pedCenterX - 56, pedTopY, 112, 14, "#7d858f");
      this.drawPixelRect(ctx, pedCenterX - 36, pedTopY - 10, 72, 10, "#a0a7b0");

      if (summon?.monsterId) {
        const monster = monsterRegistry[summon.monsterId];
        if (monster) {
          const desiredHeight = 84;
          const scale = desiredHeight / monster.baseHeight;

          ctx.save();
          ctx.translate(pedCenterX, monsterY);
          ctx.scale(scale, scale);

          drawMonster(monster, {
            ctx,
            x: 0,
            y: 0,
            time: this.time + i * 0.2,
            mouseX: (this.mouseX - pedCenterX) / scale,
            mouseY: (this.mouseY - monsterY) / scale,
            state: "HOME",
          });

          ctx.restore();

          this.drawCenteredText(
            ctx,
            monster.name.toUpperCase(),
            pedCenterX,
            rect.y + 83,
            "#f8edcc",
            10
          );
        }
      } else {
        this.drawCenteredText(
          ctx,
          "EMPTY",
          pedCenterX,
          rect.y + rect.height / 2,
          "#d7bf97",
          12
        );
      }
    }

    ctx.restore();

    const trackX = this.gridPanel.x + 18;
    const trackY = this.gridPanel.y + this.gridPanel.height - 16;
    const trackW = this.gridPanel.width - 36;
    const trackH = 8;

    this.drawPixelRect(ctx, trackX, trackY, trackW, trackH, "#4e3118");

    const thumbW =
      this.maxGridScrollX <= 0
        ? trackW
        : Math.max(
            36,
            trackW *
              (this.gridPanel.width / (this.gridPanel.width + this.maxGridScrollX))
          );

    const thumbTravel = trackW - thumbW;
    const thumbX =
      this.maxGridScrollX <= 0
        ? trackX
        : trackX + (this.gridScrollX / this.maxGridScrollX) * thumbTravel;

    this.drawPixelRect(ctx, thumbX, trackY, thumbW, trackH, "#d1b07a");
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    this.drawSky(ctx, width, height);
    this.drawMountains(ctx, width, height);
    this.drawTreeLine(ctx, width, height);
    this.drawGround(ctx, width, height);

    this.drawPixelButton(ctx, this.backButton, "BACK");
    this.drawCenteredText(ctx, "TEAM SETUP", width / 2, 42, "#fff5d7", 24);

    this.drawTeamSlotsPanel(ctx);
    this.drawBigPedestal(ctx);
    this.drawCollectionGrid(ctx);

    this.drawCenteredText(
      ctx,
      "ONLY SUMMONED MONSTERS CAN JOIN THE ACTIVE TEAM",
      width / 2,
      height - 14,
      "rgba(255,255,255,0.75)",
      12
    );
  }
}