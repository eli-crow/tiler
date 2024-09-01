import { RGBA } from "@/editor";
import { RGBAToCSS } from "@/shared";
import classes from "./Swatch.module.css";

interface SwatchProps {
  color: RGBA;
  onSelect: () => void;
}

export function Swatch({ color, onSelect }: SwatchProps) {
  return <button className={classes.root} onClick={onSelect} style={{ backgroundColor: RGBAToCSS(color) }} />;
}
