import { mergeClasses } from "@/shared";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import classes from "./IconButton.module.css";

type IconButtonProps = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button className={mergeClasses(classes.root, className)} {...props}>
      {children}
    </button>
  );
}
