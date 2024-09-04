import { IconButton } from "@/app/components/IconButton";
import BackIcon from "@/app/icons/back.svg?react";
import { ExtendHTMLProps, mergeClasses } from "@/shared";
import EditableText from "./EditableText";
import classes from "./Topbar.module.css";

type TopbarProps = ExtendHTMLProps<
  {
    title: string;
    setTitle?: (title: string) => void;
    backAction?: () => void;
  },
  HTMLDivElement
>;

export function Topbar({ children, backAction, title, setTitle, className }: TopbarProps) {
  return (
    <div className={mergeClasses(classes.root, className, "surface-translucent")}>
      {backAction && (
        <IconButton className={classes.back} onClick={backAction}>
          <BackIcon />
        </IconButton>
      )}
      {setTitle ? (
        <EditableText tag="h1" value={title} onChange={setTitle} className={classes.title} />
      ) : (
        <h1 className={classes.title}>{title}</h1>
      )}
      {children}
    </div>
  );
}
