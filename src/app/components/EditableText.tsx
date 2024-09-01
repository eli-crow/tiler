import { ExtendHTMLProps, mergeClasses } from "@/shared";
import { ChangeEventHandler, FocusEventHandler, useState } from "react";
import classes from "./EditableText.module.css";

type EditableTextProps = ExtendHTMLProps<{
  value: string;
  onChange?: (value: string) => void;
  tag?: keyof JSX.IntrinsicElements;
}>;

function EditableText({ value, onChange, tag: Tag = "p", className, ...otherProps }: EditableTextProps) {
  const [editing, setEditing] = useState(false);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(true);
    setTimeout(() => e.target.select(), 0);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(false);
  };

  return (
    <div
      className={mergeClasses(classes.root, className)}
      {...otherProps}
      data-editing={editing}
      onClick={() => console.log("click root")}
    >
      <input
        onClick={(e) => console.log("click input")}
        className={classes.input}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Tag className={classes.text}>{value}</Tag>
    </div>
  );
}

export default EditableText;
