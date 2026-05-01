export type FaintAnimationInstance = {
  update: (dt: number) => void;
  isDone: () => boolean;
  getDropOffset: () => number;
  getAlpha: () => number;
  getShadowScale: () => number;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeInCubic = (t: number) => t * t * t;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

export function createFaintAnimation(): FaintAnimationInstance {
  let time = 0;
  const duration = 0.55;

  return {
    update(dt: number) {
      time += dt;
    },

    isDone() {
      return time >= duration;
    },

    getDropOffset() {
      const t = clamp(time / duration, 0, 1);
      return 90 * easeInCubic(t);
    },

    getAlpha() {
      const t = clamp(time / duration, 0, 1);
      return 1 - 0.85 * easeOutQuad(t);
    },

    getShadowScale() {
      const t = clamp(time / duration, 0, 1);
      return 1 - 0.25 * easeOutQuad(t);
    },
  };
}