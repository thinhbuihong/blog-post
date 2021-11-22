import {
  ContentBlock,
  DraftBlockType,
  DraftHandleValue,
  Editor,
  EditorCommand,
  EditorState,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import BlockStyleControls from "./BlockStyleContrils";
import InlineStyleControls from "./InlineStyleControls";

export interface DraftEditorProps {
  editorState: EditorState;
  onChange: Function;
}

const DraftEditor = ({ editorState, onChange }: DraftEditorProps) => {
  // const [editorState, setEditorState] = useState(() =>
  //   EditorState.createEmpty()
  // );

  const setEditorState = (editorState: EditorState) => {
    onChange("editorState", editorState);
  };

  const handleKeyCommand = (command: EditorCommand): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleBlockType = (blockStyle: DraftBlockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockStyle));
  };
  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  //add class name cho block
  const getBlockStyle = (block: ContentBlock) => {
    switch (block.getType()) {
      case "blockquote":
        return "RichEditor-blockquote";
      default:
        return "";
    }
  };

  // Custom overrides for "code" style.
  const styleMap = {
    CODE: {
      // backgroundColor: 'red',
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  return (
    <div className="RichEditor-root">
      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
      />

      <div className="RichEditor-editor">
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          placeholder="Tell a story..."
        />
      </div>
    </div>
  );
};
export default DraftEditor;
