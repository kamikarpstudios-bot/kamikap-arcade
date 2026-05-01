import { drawGirlTrainer } from "../NPC's/trainers/girlTrainer";

export type BattleIntroPhase = "ENTER" | "TALK_1" | "TALK_2" | "FADE" | "DONE";

export class BattleIntroCinematic {
  phase: BattleIntroPhase = "ENTER";

  time = 0;
  phaseTimer = 0;

  trainerX = -90;

  // moved farther right so she walks longer before stopping
  trainerTargetX = 220;

  trainerY = 0;

  bubblePop = 0;
  fadeAlpha = 0;
  done = false;

  update(dt: number) {
    this.time += dt;
    this.phaseTimer += dt;

    if (this.phase === "ENTER") {
      const speed = 180;
      this.trainerX += speed * dt;

      if (this.trainerX >= this.trainerTargetX) {
        this.trainerX = this.trainerTargetX;
        this.phase = "TALK_1";
        this.phaseTimer = 0;
        this.bubblePop = 0;
      }
      return;
    }

    if (this.phase === "TALK_1" || this.phase === "TALK_2") {
      this.bubblePop = Math.min(1, this.bubblePop + dt * 6);
      return;
    }

    if (this.phase === "FADE") {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + dt * 1.8);

      if (this.fadeAlpha >= 1) {
        this.phase = "DONE";
        this.done = true;
      }
    }
  }

  onClick() {
    if (this.phase === "TALK_1") {
      this.phase = "TALK_2";
      this.phaseTimer = 0;
      this.bubblePop = 0;
      return;
    }

    if (this.phase === "TALK_2") {
      this.phase = "FADE";
      this.phaseTimer = 0;
      return;
    }
  }

  isDone() {
    return this.done;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    helpers: {
      drawWoodPanel: (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        embossed?: boolean
      ) => void;
      drawInsetPanel: (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number
      ) => void;
      drawCenteredText: (
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        color: string,
        size: number
      ) => void;
    }
  ) {
    // lower on screen
    this.trainerY = height * 0.76;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, width, height);

    this.drawTrainerShadow(ctx, this.trainerX, this.trainerY);
    this.drawTrainer(ctx, this.trainerX, this.trainerY);

    if (this.phase === "TALK_1") {
      this.drawSpeechBubble(ctx, helpers, [
        "GET READY, TRAINER!",
        "MY KIN HAVE TRAINED HARD.",
      ]);
    }

    if (this.phase === "TALK_2") {
      this.drawSpeechBubble(ctx, helpers, [
        "SHOW ME YOUR STRENGTH!",
        "CLICK TO BEGIN!",
      ]);
    }

    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  private drawTrainer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    const isWalking = this.phase === "ENTER";
    const bob = isWalking ? 0 : Math.sin(this.time * 5) * 2;

    ctx.save();

    const drawX = Math.round(x);
    const drawY = Math.round(y - 56 + bob);

    drawGirlTrainer(
      ctx,
      drawX,
      drawY,
      this.time,
      isWalking ? "WALK" : "IDLE"
    );

    ctx.restore();
  }

  private drawTrainerShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(
      Math.round(x + 28),
      Math.round(y + 34),
      24,
      8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  private drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    helpers: {
      drawWoodPanel: (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        embossed?: boolean
      ) => void;
      drawInsetPanel: (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number
      ) => void;
      drawCenteredText: (
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        color: string,
        size: number
      ) => void;
    },
    lines: [string, string]
  ) {
    const pop = 0.9 + this.bubblePop * 0.1;

    const baseW = 360;
    const baseH = 112;

    const w = baseW * pop;
    const h = baseH * pop;

    // anchor bubble relative to trainer instead of center screen
    const x = this.trainerX + 70;
    const y = this.trainerY - 150;

    helpers.drawWoodPanel(ctx, x, y, w, h, true);
    helpers.drawInsetPanel(ctx, x + 10, y + 10, w - 20, h - 20);

    // speech tail pointing back toward her head/shoulder area
    ctx.fillStyle = "#5b3419";
    ctx.fillRect(Math.round(x + 28), Math.round(y + h - 4), 18, 10);
    ctx.fillRect(Math.round(x + 18), Math.round(y + h + 6), 16, 10);
    ctx.fillRect(Math.round(x + 10), Math.round(y + h + 14), 12, 10);

    ctx.fillStyle = "#2f1a0c";
    ctx.fillRect(Math.round(x + 24), Math.round(y + h + 2), 10, 4);
    ctx.fillRect(Math.round(x + 16), Math.round(y + h + 12), 8, 4);

    helpers.drawCenteredText(ctx, lines[0], x + w / 2, y + 42, "#fff3c4", 22);
    helpers.drawCenteredText(ctx, lines[1], x + w / 2, y + 78, "#d7b787", 15);
  }
}