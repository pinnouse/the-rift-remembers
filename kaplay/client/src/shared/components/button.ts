import { Anchor, KAPLAYCtx, Vec2 } from "kaplay";

type ButtonOpts = {
  text: string;
  x: number;
  y: number;
  anchor?: Vec2 | Anchor,
  radius?: number;
  textColor?: string | number;
  background?: string | number;
  outlineColor?: string | number;
  size?: number;
};

export default function Button(
  k: KAPLAYCtx,
  opts: ButtonOpts,
  callback: () => void
) {
  const buttonText = k.add([
    k.text(opts.text, {
      size: opts.size,
    }),
    k.pos(opts.x, opts.y),
    k.anchor(opts.anchor ?? "center"),
    k.color(k.Color.fromHex(opts.textColor ?? "#ffffff")),
    k.z(102),
  ]);

  const button = k.add([
    k.rect(buttonText.width + 40, opts.size + 26, { radius: opts.radius ?? 8 }),
    k.pos(opts.x, opts.y), // Doesn't account yet for the padding if anchor is not center
    k.anchor(opts.anchor ?? "center"),
    k.color(k.Color.fromHex(opts.background ?? "#8b5cf6")),
    k.outline(3, k.Color.fromHex(opts.outlineColor ?? "#a855f7")),
    k.area(),
    k.opacity(1),
    k.z(101),
    "startButton",
  ]);

  // Pulsing animation for start button
  button.onUpdate(() => {
    button.opacity = k.wave(0.6, 1, k.time() * 2);
  });

  button.onClick(callback);
  return button;
}
