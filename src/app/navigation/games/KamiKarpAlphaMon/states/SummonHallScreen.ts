import {
  StateManager,
  EquippedMoveLoadout,
  MoveId,
} from "../systems/StateManager";
import { HomeHub } from "./HomeHub";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { drawMonster } from "../Monsters/drawMonster";
import { moveRegistry } from "../Moves/movesRegistry";

type SimpleButton = {
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

type MoveSlot = {
  id: string;
  name: string;
  power: number;
  accuracy: number;
  typeLabel: string;
  category: "SIGNATURE" | "MOVE" | "ULTIMATE";
  locked?: boolean;
  empty?: boolean;
};

type SummonSlot = {
  monsterId: keyof typeof monsterRegistry | null;
  hovered: boolean;
};

export class SummonHallScreen {
  manager: StateManager;

  private get monsterLoadouts() {
    return this.manager.monsterLoadouts;
  }

  mouseX = 0;
  mouseY = 0;
  time = 0;
  introActive = true;
  introTimer = 0;
  introDuration = 1.45;

  backButton: SimpleButton = {
    x: 28,
    y: 24,
    width: 120,
    height: 48,
    hovered: false,
  };

  summons: SummonSlot[] = [];
  selectedSummonIndex = 0;
  selectedMoveIndex = 0;

  pedestalRects: SimpleButton[] = [];

  moveSlots: SimpleButton[] = [];
  ultimateSlot: SimpleButton = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    hovered: false,
  };

  allMoveIds: MoveId[] = Object.keys(moveRegistry) as MoveId[];

  topLeftPanel = { x: 18, y: 98, width: 430, height: 336 };
  topRightPanel = { x: 462, y: 98, width: 760, height: 336 };

  gridPanel = {
    x: 34,
    y: 454,
    width: 1188,
    height: 252,
  };

  gridScrollX = 0;
  maxGridScrollX = 0;
  gridTotalCols = 8;
  gridSlotScale = 0.52;

  constructor(manager: StateManager) {
    this.manager = manager;

    this.summons = this.createSummonSlots();

    this.pedestalRects = Array.from({ length: 20 }, () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      hovered: false,
    }));

    this.moveSlots = Array.from({ length: 4 }, () => ({
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

  private createSummonSlots(): SummonSlot[] {
    const found = [
      this.findMonsterId(["KANGASHOE", "kangashoe", "Kangashoe"]),
      this.findMonsterId(["SQUNCH", "Squnch", "squnch"]),
    ].filter(Boolean) as Array<keyof typeof monsterRegistry>;

    const slots: SummonSlot[] = Array.from({ length: 20 }, (_, i) => ({
      monsterId: found[i] ?? null,
      hovered: false,
    }));

    return slots;
  }

  private findMonsterId(
    candidates: string[]
  ): keyof typeof monsterRegistry | null {
    const keys = Object.keys(monsterRegistry) as Array<
      keyof typeof monsterRegistry
    >;

    for (const candidate of candidates) {
      const exact = keys.find((k) => String(k) === candidate);
      if (exact) return exact;
    }

    for (const candidate of candidates) {
      const lower = candidate.toLowerCase();
      const match = keys.find((k) => String(k).toLowerCase() === lower);
      if (match) return match;
    }

    for (const candidate of candidates) {
      const lower = candidate.toLowerCase();
      const partial = keys.find((k) =>
        String(k).toLowerCase().includes(lower)
      );
      if (partial) return partial;
    }

    return null;
  }

  private getSelectedMonsterId(): keyof typeof monsterRegistry | null {
    return this.summons[this.selectedSummonIndex]?.monsterId ?? null;
  }

  private getSelectedMonster() {
    const id = this.getSelectedMonsterId();
    if (!id) return null;
    return monsterRegistry[id] ?? null;
  }

  private getSelectedMonsterLoadout(): EquippedMoveLoadout | null {
    const monsterId = this.getSelectedMonsterId();
    if (!monsterId) return null;
    return this.monsterLoadouts[monsterId] ?? null;
  }

  private getMoveDef(moveId: MoveId | null) {
    if (!moveId) return null;
    return moveRegistry[moveId] ?? null;
  }

  private getMoveName(moveId: MoveId | null, fallback = "EMPTY") {
    if (!moveId) return fallback;
    const move = this.getMoveDef(moveId) as
      | { name?: string; title?: string; id?: string }
      | null;
    return (
      move?.name ??
      move?.title ??
      move?.id ??
      String(moveId).replace(/_/g, " ")
    );
  }

  private getMovePower(moveId: MoveId | null) {
    const move = this.getMoveDef(moveId) as { power?: number } | null;
    return typeof move?.power === "number" ? move.power : 0;
  }

  private getMoveAccuracy(moveId: MoveId | null) {
    const move = this.getMoveDef(moveId) as { accuracy?: number } | null;
    return typeof move?.accuracy === "number" ? move.accuracy : 0;
  }

  private getMoveTypeLabel(moveId: MoveId | null) {
    const move = this.getMoveDef(moveId) as
      | { typeLabel?: string; type?: string }
      | null;
    return move?.typeLabel ?? move?.type ?? (moveId ? "NORMAL" : "---");
  }

  private buildMoveSlot(
    moveId: MoveId | null,
    category: "SIGNATURE" | "MOVE" | "ULTIMATE",
    locked = false
  ): MoveSlot {
    return {
      id: moveId ?? `${category}_EMPTY`,
      name:
        moveId === null
          ? category === "ULTIMATE"
            ? "No Ultimate"
            : "Empty"
          : this.getMoveName(moveId),
      power: this.getMovePower(moveId),
      accuracy: this.getMoveAccuracy(moveId),
      typeLabel: this.getMoveTypeLabel(moveId),
      category,
      locked,
      empty: moveId === null,
    };
  }

  private getMovesForSelectedMonster(): MoveSlot[] {
    const loadout = this.getSelectedMonsterLoadout();

    if (!loadout) {
      return [
        this.buildMoveSlot(null, "SIGNATURE", true),
        this.buildMoveSlot(null, "MOVE", true),
        this.buildMoveSlot(null, "MOVE", true),
        this.buildMoveSlot(null, "MOVE", true),
        this.buildMoveSlot(null, "ULTIMATE", true),
      ];
    }

    return [
      this.buildMoveSlot(loadout.signature, "SIGNATURE", true),
      this.buildMoveSlot(loadout.move1, "MOVE", false),
      this.buildMoveSlot(loadout.move2, "MOVE", false),
      this.buildMoveSlot(loadout.move3, "MOVE", false),
      this.buildMoveSlot(loadout.ultimate, "ULTIMATE", true),
    ];
  }

  private getSelectedMove(): MoveSlot | null {
    const moves = this.getMovesForSelectedMonster();
    return moves[this.selectedMoveIndex] ?? null;
  }

  private cycleEditableMoveSlot(slotIndex: number) {
    const monsterId = this.getSelectedMonsterId();
    if (!monsterId) return;

    const loadout = this.monsterLoadouts[monsterId];
    if (!loadout) return;

    if (slotIndex === 0) return;
    if (slotIndex === 4) return;

    const slotKey =
      slotIndex === 1 ? "move1" : slotIndex === 2 ? "move2" : "move3";

    const currentMoveId = loadout[slotKey];
    const currentIndex =
      currentMoveId === null ? -1 : this.allMoveIds.indexOf(currentMoveId);

    const nextIndex = (currentIndex + 1) % this.allMoveIds.length;
    loadout[slotKey] = this.allMoveIds[nextIndex];
  }

  private updateLayout() {
    const moveX = this.topLeftPanel.x + 18;
    const moveY = this.topLeftPanel.y + 62;
    const moveW = this.topLeftPanel.width - 36;
    const moveH = 40;
    const gap = 10;

    for (let i = 0; i < 4; i++) {
      this.moveSlots[i].x = moveX;
      this.moveSlots[i].y = moveY + i * (moveH + gap);
      this.moveSlots[i].width = moveW;
      this.moveSlots[i].height = moveH;
    }

    this.ultimateSlot.x = moveX;
    this.ultimateSlot.y = moveY + 4 * (moveH + gap) + 8;
    this.ultimateSlot.width = moveW;
    this.ultimateSlot.height = 46;

    const slotW = 168;
    const slotH = 104;
    const pedestalGapX = 12;
    const pedestalGapY = 14;

    const innerPadLeft = 26;
    const innerPadRight = 26;
    const startX = this.gridPanel.x + innerPadLeft;
    const startY = this.gridPanel.y + 52;

    const availableW = this.gridPanel.width - innerPadLeft - innerPadRight;
    const visibleCols = Math.max(
      1,
      Math.floor((availableW + pedestalGapX) / (slotW + pedestalGapX))
    );

    const totalCols = Math.max(this.gridTotalCols, visibleCols);
    const contentW = totalCols * slotW + (totalCols - 1) * pedestalGapX;
    this.maxGridScrollX = Math.max(0, contentW - availableW);

    if (this.gridScrollX > this.maxGridScrollX) {
      this.gridScrollX = this.maxGridScrollX;
    }

    for (let i = 0; i < 20; i++) {
      const col = i % totalCols;
      const row = Math.floor(i / totalCols);

      const rect = this.pedestalRects[i];
      rect.x = startX + col * (slotW + pedestalGapX) - this.gridScrollX;
      rect.y = startY + row * (slotH + pedestalGapY);
      rect.width = slotW;
      rect.height = slotH;
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

    this.pedestalRects.forEach((rect, i) => {
      const withinGridBounds =
        rect.x + rect.width >= this.gridPanel.x + 8 &&
        rect.x <= this.gridPanel.x + this.gridPanel.width - 8 &&
        rect.y + rect.height >= this.gridPanel.y + 38 &&
        rect.y <= this.gridPanel.y + this.gridPanel.height - 8;

      rect.hovered =
        withinGridBounds &&
        this.isPointInButton(rect) &&
        !!this.summons[i]?.monsterId;

      this.summons[i].hovered = rect.hovered;
    });

    this.moveSlots.forEach((slot) => {
      slot.hovered = this.isPointInButton(slot);
    });

    this.ultimateSlot.hovered = this.isPointInButton(this.ultimateSlot);
  };

  handleWheel = (event: WheelEvent) => {
    if (this.introActive) return;

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
    if (this.introActive) return;

    if (this.backButton.hovered) {
      this.destroy();
      this.manager.setState(new HomeHub(this.manager));
      return;
    }

    for (let i = 0; i < this.pedestalRects.length; i++) {
      if (this.pedestalRects[i].hovered && this.summons[i]?.monsterId) {
        this.selectedSummonIndex = i;
        this.selectedMoveIndex = 0;
        return;
      }
    }

    for (let i = 0; i < this.moveSlots.length; i++) {
      if (this.moveSlots[i].hovered) {
        if (this.selectedMoveIndex === i) {
          this.cycleEditableMoveSlot(i);
        } else {
          this.selectedMoveIndex = i;
        }
        return;
      }
    }

    if (this.ultimateSlot.hovered) {
      this.selectedMoveIndex = 4;
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

    this.updateLayout();
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

  private getBitmapGlyph(char: string): string[] {
    const glyphs: Record<string, string[]> = {
      A: ["..X..", ".X.X.", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
      B: ["XXXX.", "X...X", "X...X", "XXXX.", "X...X", "X...X", "XXXX."],
      C: [".XXXX", "X....", "X....", "X....", "X....", "X....", ".XXXX"],
      D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
      E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
      F: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "X...."],
      G: [".XXXX", "X....", "X....", "X.XXX", "X...X", "X...X", ".XXX."],
      H: ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
      I: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "XXXXX"],
      J: ["..XXX", "...X.", "...X.", "...X.", "X..X.", "X..X.", ".XX.."],
      K: ["X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"],
      L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
      M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X", "X...X", "X...X"],
      N: ["X...X", "XX..X", "XX..X", "X.X.X", "X..XX", "X..XX", "X...X"],
      O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
      P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
      Q: [".XXX.", "X...X", "X...X", "X...X", "X.X.X", "X..X.", ".XX.X"],
      R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
      S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
      T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
      U: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
      V: ["X...X", "X...X", "X...X", "X...X", ".X.X.", ".X.X.", "..X.."],
      W: ["X...X", "X...X", "X...X", "X.X.X", "X.X.X", "XX.XX", "X...X"],
      X: ["X...X", ".X.X.", ".X.X.", "..X..", ".X.X.", ".X.X.", "X...X"],
      Y: ["X...X", ".X.X.", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
      Z: ["XXXXX", "....X", "...X.", "..X..", ".X...", "X....", "XXXXX"],
      "0": [".XXX.", "X...X", "X..XX", "X.X.X", "XX..X", "X...X", ".XXX."],
      "1": ["..X..", ".XX..", "..X..", "..X..", "..X..", "..X..", ".XXX."],
      "2": [".XXX.", "X...X", "....X", "...X.", "..X..", ".X...", "XXXXX"],
      "3": [".XXX.", "X...X", "....X", "..XX.", "....X", "X...X", ".XXX."],
      "4": ["...X.", "..XX.", ".X.X.", "X..X.", "XXXXX", "...X.", "...X."],
      "5": ["XXXXX", "X....", "X....", "XXXX.", "....X", "....X", "XXXX."],
      "6": [".XXX.", "X....", "X....", "XXXX.", "X...X", "X...X", ".XXX."],
      "7": ["XXXXX", "....X", "...X.", "..X..", ".X...", ".X...", ".X..."],
      "8": [".XXX.", "X...X", "X...X", ".XXX.", "X...X", "X...X", ".XXX."],
      "9": [".XXX.", "X...X", "X...X", ".XXXX", "....X", "....X", ".XXX."],
      "!": ["..X..", "..X..", "..X..", "..X..", "..X..", ".....", "..X.."],
      "?": [".XXX.", "X...X", "....X", "...X.", "..X..", ".....", "..X.."],
      "-": [".....", ".....", ".....", ".XXX.", ".....", ".....", "....."],
      "+": [".....", "..X..", "..X..", "XXXXX", "..X..", "..X..", "....."],
      ".": [".....", ".....", ".....", ".....", ".....", "..X..", "..X.."],
      ":": [".....", "..X..", "..X..", ".....", "..X..", "..X..", "....."],
      " ": ["...", "...", "...", "...", "...", "...", "..."],
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

  private drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#f7edd1",
    size = 16
  ) {
    const scale = size <= 12 ? 1 : size <= 18 ? 2 : 3;
    const spacing = 1;
    const measure = this.measureBitmapText(text, scale, spacing);
    this.drawBitmapText(
      ctx,
      text,
      Math.round(x - measure.width / 2),
      Math.round(y - measure.height / 2),
      color,
      scale,
      spacing
    );
  }

  private drawLeftText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#f7edd1",
    size = 16
  ) {
    const scale = size <= 12 ? 1 : size <= 18 ? 2 : 3;
    const spacing = 1;
    const measure = this.measureBitmapText(text, scale, spacing);
    this.drawBitmapText(
      ctx,
      text,
      Math.round(x),
      Math.round(y - measure.height / 2),
      color,
      scale,
      spacing
    );
  }

  private drawUIScreenBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    this.drawPixelRect(ctx, 0, 0, width, height, "#241308");
    this.drawPixelRect(ctx, 6, 6, width - 12, height - 12, "#3b2211");
    this.drawPixelRect(ctx, 14, 14, width - 28, height - 28, "#5a3319");

    this.drawPixelRect(ctx, 14, 14, width - 28, 10, "#d0914f");
    this.drawPixelRect(ctx, 14, 24, width - 28, 6, "#a96833");

    this.drawPixelRect(ctx, 14, 30, 10, height - 44, "#8e572d");
    this.drawPixelRect(ctx, width - 24, 30, 10, height - 44, "#472712");

    this.drawPixelRect(ctx, 14, height - 34, width - 28, 12, "#3c2110");

    for (let y = 42; y < height - 44; y += 24) {
      const plankColor = Math.floor((y - 42) / 24) % 2 === 0 ? "#724223" : "#663a1e";
      this.drawPixelRect(ctx, 24, y, width - 48, 18, plankColor);
      this.drawPixelRect(ctx, 24, y, width - 48, 2, "#b6753d");
      this.drawPixelRect(ctx, 24, y + 16, width - 48, 2, "#563016");
    }

    for (let x = 72; x < width - 72; x += 128) {
      this.drawPixelRect(ctx, x, 38, 4, height - 76, "#5b3419");
      this.drawPixelRect(ctx, x + 4, 38, 2, height - 76, "#8d5a30");
    }
  }

  private drawWoodPanel(
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

    this.drawPixelRect(ctx, x - 8, y - 8, w + 16, h + 16, outline);

    this.drawPixelRect(ctx, x + 4, y + h + 8, w, 8, shadow);
    this.drawPixelRect(ctx, x + w, y + 4, 8, h + 12, shadow);

    this.drawPixelRect(ctx, x, y, w, h, dark);
    this.drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, mid);

    this.drawPixelRect(ctx, x + 4, y + 4, w - 8, 4, highlight);
    this.drawPixelRect(ctx, x + 4, y + 8, 4, h - 16, light);
    this.drawPixelRect(ctx, x + w - 8, y + 8, 4, h - 16, shadow);
    this.drawPixelRect(ctx, x + 4, y + h - 8, w - 8, 4, outline);

    for (let py = y + 12; py < y + h - 12; py += 16) {
      const plankColor = ((py - y) / 16) % 2 === 0 ? "#9a6030" : "#855026";
      this.drawPixelRect(ctx, x + 8, py, w - 16, 12, plankColor);
      this.drawPixelRect(ctx, x + 8, py, w - 16, 2, highlight);
      this.drawPixelRect(ctx, x + 8, py + 10, w - 16, 2, shadow);

      for (let gx = x + 18; gx < x + w - 24; gx += 36) {
        this.drawPixelRect(ctx, gx, py + 4, 8, 4, dark);
      }
    }

    this.drawPixelRect(ctx, x + 4, y + 4, 8, 8, light);
    this.drawPixelRect(ctx, x + w - 12, y + 4, 8, 8, light);
    this.drawPixelRect(ctx, x + 4, y + h - 12, 8, 8, shadow);
    this.drawPixelRect(ctx, x + w - 12, y + h - 12, 8, 8, shadow);

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

  private drawTopBanner(ctx: CanvasRenderingContext2D, width: number) {
    const banner = {
      x: 220,
      y: 16,
      w: width - 440,
      h: 54,
    };

    this.drawWoodPanel(ctx, banner.x, banner.y, banner.w, banner.h, false);

    this.drawCenteredText(
      ctx,
      "SUMMON HALL",
      banner.x + banner.w / 2,
      banner.y + banner.h / 2 + 1,
      "#fff5d7",
      24
    );
  }

  private drawPixelButton(
    ctx: CanvasRenderingContext2D,
    button: SimpleButton,
    label: string
  ) {
    const outer = button.hovered ? "#4a2c16" : "#3b2312";
    const body = button.hovered ? "#9c6938" : "#87582f";
    const light = button.hovered ? "#efbb76" : "#d69b59";
    const shadow = "#5a3519";

    this.drawPixelRect(ctx, button.x, button.y, button.width, button.height, outer);
    this.drawPixelRect(
      ctx,
      button.x + 3,
      button.y + 3,
      button.width - 6,
      button.height - 6,
      body
    );

    this.drawPixelRect(ctx, button.x + 3, button.y + 3, button.width - 6, 4, light);
    this.drawPixelRect(
      ctx,
      button.x + 3,
      button.y + button.height - 7,
      button.width - 6,
      4,
      shadow
    );

    this.drawPixelRect(
      ctx,
      button.x + 10,
      button.y + 11,
      button.width - 20,
      3,
      "#f3c786"
    );
    this.drawPixelRect(
      ctx,
      button.x + 10,
      button.y + 16,
      button.width - 20,
      2,
      "#6f4522"
    );

    this.drawCenteredText(
      ctx,
      label,
      button.x + button.width / 2,
      button.y + button.height / 2 + 1,
      "#fff1cf",
      16
    );
  }

  private drawMoveSlot(
    ctx: CanvasRenderingContext2D,
    button: SimpleButton,
    move: MoveSlot,
    selected: boolean
  ) {
    const frame = selected ? "#f0cf79" : "#4a2c16";
    const body = selected ? "#8f6231" : button.hovered ? "#7e562f" : "#6b4727";
    const inner = selected ? "#a9783d" : "#8a6035";

    this.drawPixelRect(ctx, button.x, button.y, button.width, button.height, frame);
    this.drawPixelRect(
      ctx,
      button.x + 3,
      button.y + 3,
      button.width - 6,
      button.height - 6,
      body
    );
    this.drawPixelRect(
      ctx,
      button.x + 7,
      button.y + 7,
      button.width - 14,
      button.height - 14,
      inner
    );

    this.drawPixelRect(ctx, button.x + 7, button.y + 7, button.width - 14, 3, "#d8a765");
    this.drawPixelRect(
      ctx,
      button.x + 7,
      button.y + button.height - 10,
      button.width - 14,
      3,
      "#5d381b"
    );

    const badgeColor =
      move.category === "SIGNATURE"
        ? "#b94b4b"
        : move.category === "ULTIMATE"
        ? "#4d63c9"
        : "#3e8b55";

    this.drawPixelRect(
      ctx,
      button.x + 12,
      button.y + 10,
      78,
      button.height - 20,
      "#3a2110"
    );
    this.drawPixelRect(
      ctx,
      button.x + 15,
      button.y + 13,
      72,
      button.height - 26,
      badgeColor
    );

    this.drawLeftText(
      ctx,
      move.category,
      button.x + 22,
      button.y + button.height / 2,
      "#fff6df",
      11
    );

    this.drawLeftText(
      ctx,
      move.name.toUpperCase(),
      button.x + 100,
      button.y + button.height / 2,
      "#fff1cf",
      14
    );

    if (move.locked) {
      this.drawLeftText(
        ctx,
        "LOCKED",
        button.x + button.width - 76,
        button.y + button.height / 2,
        "#ffe398",
        11
      );
    } else if (move.empty) {
      this.drawLeftText(
        ctx,
        "CLICK",
        button.x + button.width - 66,
        button.y + button.height / 2,
        "#ffe398",
        11
      );
    }
  }

  private drawMoveDetails(ctx: CanvasRenderingContext2D) {
    const move = this.getSelectedMove();
    if (!move) return;

    const x = this.topLeftPanel.x + 18;
    const y = this.topLeftPanel.y + 254;
    const w = this.topLeftPanel.width - 36;
    const h = 34;

    this.drawPixelRect(ctx, x, y, w, h, "#4f3219");
    this.drawPixelRect(ctx, x + 4, y + 4, w - 8, h - 8, "#d1b07a");

    this.drawLeftText(ctx, `POW ${move.power}`, x + 12, y + 17, "#3a2412", 12);
    this.drawLeftText(
      ctx,
      `ACC ${move.accuracy}`,
      x + 100,
      y + 17,
      "#3a2412",
      12
    );
    this.drawLeftText(
      ctx,
      `TYPE ${move.typeLabel}`,
      x + 188,
      y + 17,
      "#3a2412",
      12
    );
  }

  private drawBigPedestal(ctx: CanvasRenderingContext2D) {
    const panel = this.topRightPanel;
    const monster = this.getSelectedMonster();
    const centerX = panel.x + panel.width / 2;

    const pedestalBaseY = panel.y + panel.height - 54;
    const monsterY = pedestalBaseY - 180;

    this.drawWoodPanel(ctx, panel.x, panel.y, panel.width, panel.height, false);

    this.drawCenteredText(
      ctx,
      "SUMMON DISPLAY",
      panel.x + panel.width / 2,
      panel.y + 24,
      "#fff0c7",
      18
    );

    this.drawPixelRect(ctx, centerX - 160, panel.y + 42, 320, 4, "#e0b673");
    this.drawPixelRect(ctx, centerX - 170, panel.y + 46, 340, 2, "#5e3719");

    this.drawPixelRect(
      ctx,
      centerX - 132,
      pedestalBaseY - 10,
      264,
      28,
      "#6f7781"
    );
    this.drawPixelRect(
      ctx,
      centerX - 102,
      pedestalBaseY - 22,
      204,
      14,
      "#8d949d"
    );
    this.drawPixelRect(
      ctx,
      centerX - 64,
      pedestalBaseY - 48,
      128,
      26,
      "#aeb5be"
    );

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(centerX, pedestalBaseY + 22, 96, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (monster) {
      drawMonster(monster, {
        ctx,
        x: centerX,
        y: monsterY,
        time: this.time,
        mouseX: this.mouseX,
        mouseY: this.mouseY,
        state: "HOME",
      });

      this.drawCenteredText(
        ctx,
        monster.name.toUpperCase(),
        centerX,
        panel.y + 60,
        "#fcefcf",
        18
      );
    } else {
      this.drawCenteredText(
        ctx,
        "EMPTY PEDESTAL",
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
        ? "#ffd0a8"
        : summon.hovered
        ? "#d8892f"
        : "#5d341c";
      const inner = selected ? "#82c35f" : "#5f80d4";

      this.drawPixelRect(ctx, rect.x, rect.y, rect.width, rect.height, outer);
      this.drawPixelRect(
        ctx,
        rect.x + 4,
        rect.y + 4,
        rect.width - 8,
        rect.height - 8,
        inner
      );

      this.drawPixelRect(ctx, rect.x + 8, rect.y + 8, rect.width - 16, 3, "#ffd7a0");
      this.drawPixelRect(
        ctx,
        rect.x + 8,
        rect.y + rect.height - 11,
        rect.width - 16,
        3,
        "#8b4c2b"
      );

      this.drawPixelRect(ctx, rect.x + 10, rect.y + 10, 6, 6, "#c9a35a");
      this.drawPixelRect(ctx, rect.x + rect.width - 16, rect.y + 10, 6, 6, "#c9a35a");
      this.drawPixelRect(ctx, rect.x + 10, rect.y + rect.height - 16, 6, 6, "#7c5527");
      this.drawPixelRect(
        ctx,
        rect.x + rect.width - 16,
        rect.y + rect.height - 16,
        6,
        6,
        "#7c5527"
      );

      const pedCenterX = rect.x + rect.width / 2;
      const pedTopY = rect.y + rect.height - 24;
      const monsterY = pedTopY - 92;

      this.drawPixelRect(ctx, pedCenterX - 56, pedTopY, 112, 14, "#7d858f");
      this.drawPixelRect(ctx, pedCenterX - 36, pedTopY - 10, 72, 10, "#a0a7b0");

      if (summon.monsterId) {
        const monster = monsterRegistry[summon.monsterId];
        if (monster) {
          ctx.save();
          ctx.translate(pedCenterX, monsterY);
          ctx.scale(this.gridSlotScale, this.gridSlotScale);

          drawMonster(monster, {
            ctx,
            x: 0,
            y: 0,
            time: this.time + i * 0.2,
            mouseX: (this.mouseX - pedCenterX) / this.gridSlotScale,
            mouseY: (this.mouseY - monsterY) / this.gridSlotScale,
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
              (this.gridPanel.width /
                (this.gridPanel.width + this.maxGridScrollX))
          );

    const thumbTravel = trackW - thumbW;
    const thumbX =
      this.maxGridScrollX <= 0
        ? trackX
        : trackX + (this.gridScrollX / this.maxGridScrollX) * thumbTravel;

    this.drawPixelRect(ctx, thumbX, trackY, thumbW, trackH, "#d1b07a");
    this.drawPixelRect(ctx, thumbX, trackY, thumbW, 2, "#f5d491");
    this.drawPixelRect(ctx, thumbX, trackY + trackH - 2, thumbW, 2, "#734a23");
  }

  private drawMovesPanel(ctx: CanvasRenderingContext2D) {
    const moves = this.getMovesForSelectedMonster();

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
      "MOVE LOADOUT",
      this.topLeftPanel.x + this.topLeftPanel.width / 2,
      this.topLeftPanel.y + 26,
      "#fff0c7",
      18
    );

    for (let i = 0; i < 4; i++) {
      const move = moves[i];
      if (!move) continue;
      this.drawMoveSlot(ctx, this.moveSlots[i], move, this.selectedMoveIndex === i);
    }

    if (moves[4]) {
      this.drawMoveSlot(
        ctx,
        this.ultimateSlot,
        moves[4],
        this.selectedMoveIndex === 4
      );
    }

    this.drawMoveDetails(ctx);

    this.drawCenteredText(
      ctx,
      "CLICK A MOVE SLOT, THEN CLICK AGAIN TO CYCLE",
      this.topLeftPanel.x + this.topLeftPanel.width / 2,
      this.topLeftPanel.y + this.topLeftPanel.height - 18,
      "#f4ddb4",
      10
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    const introT = this.clamp(this.introTimer / this.introDuration, 0, 1);
    const cameraSettle = this.easeOutCubic(introT);
    const cameraDropY = (1 - cameraSettle) * -28;
    const topProgress = this.easeOutCubic(
      this.clamp((this.introTimer - 0.08) / 0.42, 0, 1)
    );
    const topOffsetY = (1 - topProgress) * -112;
    const movesProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.18) / 0.54, 0, 1)
    );
    const movesOffsetX = (1 - movesProgress) * -180;
    const pedestalProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.24) / 0.56, 0, 1)
    );
    const pedestalOffsetX = (1 - pedestalProgress) * 190;
    const gridProgress = this.easeOutBack(
      this.clamp((this.introTimer - 0.34) / 0.58, 0, 1)
    );
    const gridOffsetY = (1 - gridProgress) * 92;
    const gridScaleY = 0.78 + gridProgress * 0.22;
    const fadeAlpha = 1 - this.clamp(this.introTimer / 0.58, 0, 1);

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    ctx.translate(0, cameraDropY);

    this.drawUIScreenBackground(ctx, width, height);

    ctx.save();
    ctx.translate(0, topOffsetY);
    this.drawPixelButton(ctx, this.backButton, "BACK");
    this.drawTopBanner(ctx, width);
    ctx.restore();

    ctx.save();
    ctx.translate(movesOffsetX, 0);
    this.drawMovesPanel(ctx);
    ctx.restore();

    ctx.save();
    ctx.translate(pedestalOffsetX, 0);
    this.drawBigPedestal(ctx);
    ctx.restore();

    ctx.save();
    ctx.translate(0, gridOffsetY);
    ctx.translate(
      this.gridPanel.x + this.gridPanel.width / 2,
      this.gridPanel.y
    );
    ctx.scale(1, gridScaleY);
    ctx.translate(
      -(this.gridPanel.x + this.gridPanel.width / 2),
      -this.gridPanel.y
    );
    this.drawCollectionGrid(ctx);
    ctx.restore();

    this.drawCenteredText(
      ctx,
      "SIGNATURE + 3 MOVES + ULTIMATE",
      width / 2,
      height - 14,
      "rgba(255,255,255,0.75)",
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
