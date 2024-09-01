import { ExtendHTMLProps, mergeClasses } from "@/shared";
import { ChangeEventHandler, FocusEventHandler, useEffect, useState } from "react";
import classes from "./EditableText.module.css";

type EditableTextProps = ExtendHTMLProps<{
  value: string;
  onChange?: (value: string) => void;
  tag?: keyof JSX.IntrinsicElements;
}>;

function EditableText({ value, onChange, tag: Tag = "p", className, ...otherProps }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    if (!internalValue && value) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInternalValue(e.target.value);
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(true);
    setTimeout(() => e.target.select(), 0);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(false);
    if (onChange && internalValue !== value) {
      onChange(internalValue);
    }
  };

  const handleRootClick = (e: React.MouseEvent) => {
    if (!(e.target instanceof HTMLInputElement)) {
      e.currentTarget.querySelector("input")?.focus();
    }
  };

  const displayValue = internalValue.replace(/ /g, "\u00a0") || "\u00a0";

  return (
    <div
      onClickCapture={handleRootClick}
      className={mergeClasses(classes.root, className)}
      {...otherProps}
      data-editing={editing}
    >
      <input
        className={classes.input}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Tag className={classes.text}>{displayValue}</Tag>
    </div>
  );
}

export default EditableText;
