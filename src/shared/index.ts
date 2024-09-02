import { RGBA } from "@/editor/model";
import { HTMLProps } from "react";

export function RGBAToCSS(rgba: RGBA): string {
  const [r, g, b, a] = rgba;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

export function mergeClasses(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export type ExtendHTMLProps<Props extends object = never, Element extends HTMLElement = HTMLDivElement> = Omit<
  HTMLProps<Element>,
  keyof Props
> &
  Props;

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
