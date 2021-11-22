import { MouseEventHandler } from "react";

export interface StyleButtonProps {
  active: boolean;
  label: string;
  onToggle: (style: string) => void;
  style: string;
}

const StyleButton = ({ onToggle, active, label, style }: StyleButtonProps) => {
  const onMouseDown: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    onToggle(style);
  };

  let className = "RichEditor-styleButton";
  if (active) {
    className += " RichEditor-activeButton";
  }

  return (
    <span className={className} onMouseDown={onMouseDown}>
      {label}
    </span>
  );
};

export default StyleButton;
