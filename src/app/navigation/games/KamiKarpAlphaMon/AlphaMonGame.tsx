"use client";

import React, { useEffect, useRef } from "react";
import { StateManager } from "./systems/StateManager";
import { LoginScreen } from "./states/LoginScreen";

export default function AlphaMonGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateManager = useRef(new StateManager());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    stateManager.current.setState(new LoginScreen(stateManager.current));

    let animationId = 0;

    const gameLoop = () => {
      stateManager.current.update();
      stateManager.current.draw(ctx);
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
    />
  );
}