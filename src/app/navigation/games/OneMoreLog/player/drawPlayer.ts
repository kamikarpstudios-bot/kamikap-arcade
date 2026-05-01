import { Player } from "./player";
import { getPlayerPose } from "./playerAnimations";
function shadeColor(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const t = Math.max(0, Math.min(1, 1 - amount));

  const nr = Math.max(0, Math.min(255, Math.round(r * t)));
  const ng = Math.max(0, Math.min(255, Math.round(g * t)));
  const nb = Math.max(0, Math.min(255, Math.round(b * t)));

  return `rgb(${nr}, ${ng}, ${nb})`;
}
function warmLightColor(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.round(r + 90 * amount));
  g = Math.min(255, Math.round(g + 55 * amount));
  b = Math.min(255, Math.round(b + 10 * amount));

  return `rgb(${r}, ${g}, ${b})`;
}

function toneColor(hex: string, shadowAmount = 0, fireLightAmount = 0) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const darkT = Math.max(0, Math.min(1, 1 - shadowAmount));
  r = Math.round(r * darkT);
  g = Math.round(g * darkT);
  b = Math.round(b * darkT);

  r = Math.min(255, Math.round(r + 90 * fireLightAmount));
  g = Math.min(255, Math.round(g + 55 * fireLightAmount));
  b = Math.min(255, Math.round(b + 10 * fireLightAmount));

  return `rgb(${r}, ${g}, ${b})`;
}

function drawOval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Player["facing"],
  shadowAmount = 0,
  fireLightAmount = 0
) {
  const hairColor = toneColor("#2a211d", shadowAmount, fireLightAmount);

  if (facing === "up") {
    drawOval(ctx, x, y - 1, 9.6, 10.8, hairColor);
    drawOval(ctx, x, y + 2.2, 7.2, 5.5, hairColor);
    return;
  }

  if (facing === "up-left" || facing === "down-left" || facing === "left") {
    drawOval(ctx, x - 1.2, y - 2, 9, 7.2, hairColor);
    drawOval(ctx, x - 4.2, y - 0.5, 4.2, 5.2, hairColor);
    return;
  }

  if (facing === "up-right" || facing === "down-right" || facing === "right") {
    drawOval(ctx, x + 1.2, y - 2, 9, 7.2, hairColor);
    drawOval(ctx, x + 4.2, y - 0.5, 4.2, 5.2, hairColor);
    return;
  }

  drawOval(ctx, x, y - 3, 9, 6.5, hairColor);
}

function backLegX(base: number, side: -1 | 1) {
  return base - 0.4 * side;
}

function drawFrontLegOverlapPatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.beginPath();
  ctx.rect(-rx * 1.2, -ry * 1.15, rx * 2.4, ry * 0.95);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function drawDownPoseLower(
  ctx: CanvasRenderingContext2D,
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0,
  pose = {
    bodyYOffset: 0,
    leftArmReach: 0,
    rightArmReach: 0,
    leftArmSwingAdd: 0,
    rightArmSwingAdd: 0,
  }
) {
  const skinBack = shadeColor("#c89a78", shadowAmount);
  const skinFront = shadeColor("#d9b08c", shadowAmount);
  const pants = shadeColor("#3b2f2f", shadowAmount);

  const torsoX = 0;
  const torsoY = 4 + bob + pose.bodyYOffset;

  const leftShoulderX = torsoX - 7.5;
  const rightShoulderX = torsoX + 7.5;
  const shoulderY = torsoY - 3.5;

  const leftHipX = torsoX - 3.8;
  const rightHipX = torsoX + 3.8;
  const hipY = torsoY + 9.2;

  const leftArmX = leftShoulderX;
  const rightArmX = rightShoulderX;
  const leftArmY = shoulderY + 4 + walkB * 0.9 + pose.leftArmReach;
  const rightArmY = shoulderY + 4 + walkA * 0.9 + pose.rightArmReach;

  const leftLegX = leftHipX;
  const rightLegX = rightHipX;
  const leftLegY = hipY + 6.2 + walkA * 1.2;
  const rightLegY = hipY + 6.2 + walkB * 1.2;

  const leftArmRot = 0.18 + walkB * 0.16 + pose.leftArmSwingAdd;
  const rightArmRot = -0.18 + walkA * 0.16 + pose.rightArmSwingAdd;
  const leftLegRot = 0.1 + walkA * 0.14;
  const rightLegRot = -0.1 + walkB * 0.14;

  drawOval(ctx, leftArmX, leftArmY, 2.4, 7.8, skinBack, leftArmRot);
  drawOval(ctx, rightArmX, rightArmY, 2.4, 7.8, skinFront, rightArmRot);

  const leftLegIsBack = walkA < walkB;

  if (leftLegIsBack) {
    drawOval(ctx, leftLegX, leftLegY, 3, 10, pants, leftLegRot);
    drawOval(ctx, rightLegX, rightLegY, 3, 10, pants, rightLegRot);
  } else {
    drawOval(ctx, rightLegX, rightLegY, 3, 10, pants, rightLegRot);
    drawOval(ctx, leftLegX, leftLegY, 3, 10, pants, leftLegRot);
  }

  drawOval(ctx, leftArmX, leftArmY + 7.2, 1.9, 1.9, skinBack);
  drawOval(ctx, rightArmX, rightArmY + 7.2, 1.9, 1.9, skinFront);
}

function drawDownPoseUpper(
  ctx: CanvasRenderingContext2D,
  bob: number,
  shadowAmount = 0,
  pose = {
    bodyYOffset: 0,
    headYOffset: 0,
    torsoLean: 0,
  }
) {
  const shirt = shadeColor("#5f8f54", shadowAmount);
  const skin = shadeColor("#d9b08c", shadowAmount);

  const torsoX = pose.torsoLean * 8;
  const torsoY = 4 + bob + pose.bodyYOffset;

  drawOval(ctx, torsoX, torsoY, 8, 12, shirt, pose.torsoLean);
  drawOval(ctx, torsoX, -12 + bob * 0.6 + pose.headYOffset, 9, 10, skin);
  drawHair(
    ctx,
    torsoX,
    -12 + bob * 0.6 + pose.headYOffset,
    "down",
    shadowAmount
  );
}

function drawUpPoseLower(
  ctx: CanvasRenderingContext2D,
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0
) {
  const skinBack = shadeColor("#c89a78", shadowAmount);
  const skinFront = shadeColor("#d9b08c", shadowAmount);
  const pants = shadeColor("#3b2f2f", shadowAmount);

  const torsoX = 0;
  const torsoY = 4 + bob;

  const leftShoulderX = torsoX - 7.2;
  const rightShoulderX = torsoX + 7.2;
  const shoulderY = torsoY - 3.3;

  const leftHipX = torsoX - 3.8;
  const rightHipX = torsoX + 3.8;
  const hipY = torsoY + 9.2;

  const leftArmY = shoulderY + 4 + walkB * 0.85;
  const rightArmY = shoulderY + 4 + walkA * 0.85;
  const leftLegY = hipY + 6 + walkA * 1.1;
  const rightLegY = hipY + 6 + walkB * 1.1;

  drawOval(
    ctx,
    leftShoulderX,
    leftArmY,
    2.3,
    7.5,
    skinBack,
    0.14 + walkB * 0.14
  );
  drawOval(
    ctx,
    rightShoulderX,
    rightArmY,
    2.3,
    7.5,
    skinFront,
    -0.14 + walkA * 0.14
  );

  const leftLegRot = 0.08 + walkA * 0.12;
  const rightLegRot = -0.08 + walkB * 0.12;
  const leftLegIsBack = walkA < walkB;

  if (leftLegIsBack) {
    drawOval(ctx, leftHipX, leftLegY, 3, 10, pants, leftLegRot);
    drawOval(ctx, rightHipX, rightLegY, 3, 10, pants, rightLegRot);
  } else {
    drawOval(ctx, rightHipX, rightLegY, 3, 10, pants, rightLegRot);
    drawOval(ctx, leftHipX, leftLegY, 3, 10, pants, leftLegRot);
  }
}

function drawUpPoseUpper(
  ctx: CanvasRenderingContext2D,
  bob: number,
  shadowAmount = 0
) {
  const shirt = shadeColor("#5f8f54", shadowAmount);
  const skin = shadeColor("#d9b08c", shadowAmount);

  const torsoX = 0;
  const torsoY = 4 + bob;

  drawOval(ctx, torsoX, torsoY, 8, 12, shirt);
  drawOval(ctx, 0, -12 + bob * 0.6, 9, 10, skin);
  drawHair(ctx, 0, -12 + bob * 0.6, "up", shadowAmount);
}

function drawSidePoseLower(
  ctx: CanvasRenderingContext2D,
  side: -1 | 1,
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0
) {
  const backLegColor = shadeColor("#2f2525", shadowAmount);
  const frontLegColor = shadeColor("#3b2f2f", shadowAmount);
  const backArmColor = shadeColor("#b98b6d", shadowAmount);
  const frontArmColor = shadeColor("#d9b08c", shadowAmount);

  const torsoX = 1.8 * side;
  const torsoY = 4 + bob;

  const backHipX = torsoX - 2.8 * side;
  const frontHipX = torsoX + 3.2 * side;
  const hipY = torsoY + 9.2;

  const backShoulderX = torsoX - 4.8 * side;
  const frontShoulderX = torsoX + 5.2 * side;
  const shoulderY = torsoY - 3.6;

  const backLegY = hipY + 5.3 + walkB * 1.0;
  const frontLegY = hipY + 6.7 + walkA * 1.1;
  const backArmY = shoulderY + 4 + walkA * 0.9;
  const frontArmY = shoulderY + 5.2 + walkB * 0.9;

  const backLeg = {
    x: backLegX(backHipX, side),
    y: backLegY,
    rx: 2.5,
    ry: 9.2,
    color: backLegColor,
    rot: 0.12 * side,
  };

  const frontLeg = {
    x: frontHipX,
    y: frontLegY,
    rx: 3.1,
    ry: 10.2,
    color: frontLegColor,
    rot: -0.18 * side,
  };

  const backArm = {
    x: backShoulderX,
    y: backArmY,
    rx: 2.1,
    ry: 7.2,
    color: backArmColor,
    rot: 0.28 * side,
  };

  const frontArm = {
    x: frontShoulderX,
    y: frontArmY,
    rx: 2.4,
    ry: 8.4,
    color: frontArmColor,
    rot: -0.42 * side,
  };

  drawOval(
    ctx,
    backLeg.x,
    backLeg.y,
    backLeg.rx,
    backLeg.ry,
    backLeg.color,
    backLeg.rot
  );
  drawOval(
    ctx,
    backArm.x,
    backArm.y,
    backArm.rx,
    backArm.ry,
    backArm.color,
    backArm.rot
  );

  drawOval(
    ctx,
    frontLeg.x,
    frontLeg.y,
    frontLeg.rx,
    frontLeg.ry,
    frontLeg.color,
    frontLeg.rot
  );
  drawOval(
    ctx,
    frontArm.x,
    frontArm.y,
    frontArm.rx,
    frontArm.ry,
    frontArm.color,
    frontArm.rot
  );

  drawOval(
    ctx,
    frontShoulderX + 2 * side,
    frontArmY + 7.1,
    1.9,
    1.9,
    frontArmColor
  );
}

function drawSidePoseUpper(
  ctx: CanvasRenderingContext2D,
  side: -1 | 1,
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0
) {
  const shirt = shadeColor("#5f8f54", shadowAmount);
  const skin = shadeColor("#d9b08c", shadowAmount);
  const frontLegColor = shadeColor("#3b2f2f", shadowAmount);

  const torsoX = 1.8 * side;
  const torsoY = 4 + bob;

  const frontHipX = torsoX + 3.2 * side;
  const hipY = torsoY + 9.2;
  const frontLegY = hipY + 6.7 + walkA * 1.1;
  const frontLegRot = -0.18 * side;

  drawOval(ctx, torsoX, torsoY, 6.5, 12, shirt);

  drawFrontLegOverlapPatch(
    ctx,
    frontHipX,
    frontLegY - 2.2,
    2.35,
    4.7,
    frontLegRot,
    frontLegColor
  );

  const headX = 3.6 * side;
  drawOval(ctx, headX, -12 + bob * 0.6, 8.1, 10, skin);
  drawHair(ctx, headX, -12 + bob * 0.6, side === -1 ? "left" : "right", shadowAmount);
}

function drawDiagonalPoseLower(
  ctx: CanvasRenderingContext2D,
  facing: "down-left" | "down-right" | "up-left" | "up-right",
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0
) {
  const side: -1 | 1 =
    facing === "down-left" || facing === "up-left" ? -1 : 1;

  const leftLegColor = shadeColor("#343434", shadowAmount);
  const rightLegColor = shadeColor("#3b2f2f", shadowAmount);
  const leftArmColor = shadeColor("#bc8f72", shadowAmount);
  const rightArmColor = shadeColor("#d9b08c", shadowAmount);

  const torsoX = 1.2 * side;
  const torsoY = 4 + bob;

  const leftHipX = torsoX - 3.8;
  const rightHipX = torsoX + 2.8;
  const hipY = torsoY + 9.1;

  const leftShoulderX = torsoX - 6.6;
  const rightShoulderX = torsoX + 6.2;
  const shoulderY = torsoY - 3.5;

  const leftLegY = hipY + 5.8 + walkA * 0.95;
  const rightLegY = hipY + 6.5 + walkB * 1.05;

  const leftArmY = shoulderY + 4.1 + walkA * 0.75;
  const rightArmY = shoulderY + 4.8 + walkB * 0.8;

  const leftLeg = {
    x: leftHipX,
    y: leftLegY,
    rx: 2.8,
    ry: 9.8,
    color: leftLegColor,
    rot: 0.06 + 0.08 * side,
  };

  const rightLeg = {
    x: rightHipX,
    y: rightLegY,
    rx: 3,
    ry: 10.1,
    color: rightLegColor,
    rot: -0.05 + 0.08 * side,
  };

  const leftArm = {
    x: leftShoulderX,
    y: leftArmY,
    rx: 2.2,
    ry: 7.3,
    color: leftArmColor,
    rot: 0.12 + 0.16 * side,
  };

  const rightArm = {
    x: rightShoulderX,
    y: rightArmY,
    rx: 2.4,
    ry: 8,
    color: rightArmColor,
    rot: -0.1 + 0.14 * side,
  };

  const leftSideInFront = facing === "up-left" || facing === "down-right";

  const backLeg = leftSideInFront ? rightLeg : leftLeg;
  const frontLeg = leftSideInFront ? leftLeg : rightLeg;

  const backArm = leftSideInFront ? rightArm : leftArm;
  const frontArm = leftSideInFront ? leftArm : rightArm;

  drawOval(
    ctx,
    backLeg.x,
    backLeg.y,
    backLeg.rx,
    backLeg.ry,
    backLeg.color,
    backLeg.rot
  );
  drawOval(
    ctx,
    backArm.x,
    backArm.y,
    backArm.rx,
    backArm.ry,
    backArm.color,
    backArm.rot
  );

  drawOval(
    ctx,
    frontLeg.x,
    frontLeg.y,
    frontLeg.rx,
    frontLeg.ry,
    frontLeg.color,
    frontLeg.rot
  );
  drawOval(
    ctx,
    frontArm.x,
    frontArm.y,
    frontArm.rx,
    frontArm.ry,
    frontArm.color,
    frontArm.rot
  );

  drawOval(
    ctx,
    frontArm.x + 1.3 * side,
    frontArm.y + 7.2,
    1.9,
    1.9,
    rightArmColor
  );
}

function drawDiagonalPoseUpper(
  ctx: CanvasRenderingContext2D,
  facing: "down-left" | "down-right" | "up-left" | "up-right",
  walkA: number,
  walkB: number,
  bob: number,
  shadowAmount = 0
) {
  const side: -1 | 1 =
    facing === "down-left" || facing === "up-left" ? -1 : 1;

  const shirt = shadeColor("#5f8f54", shadowAmount);
  const skin = shadeColor("#d9b08c", shadowAmount);
  const leftLegColor = shadeColor("#343434", shadowAmount);
  const rightLegColor = shadeColor("#3b2f2f", shadowAmount);

  const torsoX = 1.2 * side;
  const torsoY = 4 + bob;

  const leftHipX = torsoX - 3.8;
  const rightHipX = torsoX + 2.8;
  const hipY = torsoY + 9.1;

  const leftLegY = hipY + 5.8 + walkA * 0.95;
  const rightLegY = hipY + 6.5 + walkB * 1.05;

  const leftLeg = {
    x: leftHipX,
    y: leftLegY,
    rot: 0.06 + 0.08 * side,
    color: leftLegColor,
  };

  const rightLeg = {
    x: rightHipX,
    y: rightLegY,
    rot: -0.05 + 0.08 * side,
    color: rightLegColor,
  };

  const leftSideInFront = facing === "up-left" || facing === "down-right";
  const frontLeg = leftSideInFront ? leftLeg : rightLeg;

  drawOval(ctx, torsoX, torsoY, 7.4, 12, shirt);

  drawFrontLegOverlapPatch(
    ctx,
    frontLeg.x,
    frontLeg.y - 2.4,
    2.25,
    4.9,
    frontLeg.rot,
    frontLeg.color
  );

  const headX = 2.5 * side;
  drawOval(ctx, headX, -12 + bob * 0.6, 8.6, 10, skin);
  drawHair(ctx, headX, -12 + bob * 0.6, facing, shadowAmount);
}

export function drawPlayerLowerBody(
  ctx: CanvasRenderingContext2D,
  player: Player,
  shadowAmount = 0,
  fireLightAmount = 0
) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(player.scale, player.scale);

  const walkA = player.isMoving ? Math.sin(player.walkTime * 10) : 0;
  const walkB = player.isMoving
    ? Math.sin(player.walkTime * 10 + Math.PI)
    : 0;
  const bob = player.isMoving ? Math.sin(player.walkTime * 20) * 0.9 : 0;
  const pose = getPlayerPose(player);

  switch (player.facing) {
    case "down":
      drawDownPoseLower(ctx, walkA, walkB, bob, shadowAmount, pose);
      break;

    case "up":
      drawUpPoseLower(ctx, walkA, walkB, bob, shadowAmount);
      break;

    case "left":
      drawSidePoseLower(ctx, -1, walkA, walkB, bob, shadowAmount);
      break;

    case "right":
      drawSidePoseLower(ctx, 1, walkA, walkB, bob, shadowAmount);
      break;

    case "down-left":
    case "down-right":
    case "up-left":
    case "up-right":
      drawDiagonalPoseLower(ctx, player.facing, walkA, walkB, bob, shadowAmount);
      break;
  }

  ctx.restore();
}

export function drawPlayerUpperBody(
  ctx: CanvasRenderingContext2D,
  player: Player,
  shadowAmount = 0,
  fireLightAmount = 0
) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(player.scale, player.scale);

  const walkA = player.isMoving ? Math.sin(player.walkTime * 10) : 0;
  const walkB = player.isMoving
    ? Math.sin(player.walkTime * 10 + Math.PI)
    : 0;
  const bob = player.isMoving ? Math.sin(player.walkTime * 20) * 0.9 : 0;
  const pose = getPlayerPose(player);

  switch (player.facing) {
    case "down":
      drawDownPoseUpper(ctx, bob, shadowAmount, pose);
      break;

    case "up":
      drawUpPoseUpper(ctx, bob, shadowAmount);
      break;

    case "left":
      drawSidePoseUpper(ctx, -1, walkA, walkB, bob, shadowAmount);
      break;

    case "right":
      drawSidePoseUpper(ctx, 1, walkA, walkB, bob, shadowAmount);
      break;

    case "down-left":
    case "down-right":
    case "up-left":
    case "up-right":
      drawDiagonalPoseUpper(ctx, player.facing, walkA, walkB, bob, shadowAmount);
      break;
  }

  ctx.restore();
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  shadowAmount = 0
) {
  drawPlayerLowerBody(ctx, player, shadowAmount);
  drawPlayerUpperBody(ctx, player, shadowAmount);
}