import { EditorState } from "draft-js";
import StyleButton from "./StyleButton";

const INLINE_STYLES = [
  {
    label: "Bold",
    style: "BOLD",
  },
  {
    label: "Italic",
    style: "ITALIC",
  },
  {
    label: "Underline",
    style: "UNDERLINE",
  },
  {
    label: "Monospace",
    style: "CODE",
  },
];
interface InlineStyleControlsProps {
  editorState: EditorState;
  onToggle: (inlineStyle: string) => void;
}

const InlineStyleControls = ({
  editorState,
  onToggle,
}: InlineStyleControlsProps) => {
  var currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export default InlineStyleControls;
