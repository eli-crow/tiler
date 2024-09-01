import { RGBA } from "@/editor/model";

export function RGBAToCSS(rgba: RGBA): string {
  const [r, g, b, a] = rgba;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

export function mergeClasses(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
