import {
  CompositeDecorator,
  convertToRaw,
  DraftBlockType,
  DraftHandleValue,
  Editor,
  EditorCommand,
  EditorState,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import BlockStyleControls from "./BlockStyleControls";
import { getBlockStyle } from "./blockStyleFn";
import LinkEntity, { findLinkEntities } from "./entities/LinkEntity";
import InlineStyleControls from "./InlineStyleControls";
import { styleMap } from "./styleMap";

export interface DraftEditorProps {
  editorState: EditorState;
  onChange: Function;
}

const decorator = new CompositeDecorator([
  { strategy: findLinkEntities, component: LinkEntity },
]);

const DraftEditor = ({ editorState, onChange }: DraftEditorProps) => {
  // const [editorState, setEditorState] = useState(() =>
  //   EditorState.createEmpty()
  // );
  const [URL, setURL] = useState({ showURLInput: false, urlValue: "" });
  const editor = useRef<Editor>(null);

  const setEditorState = (editorState: any) => {
    onChange("editorState", editorState);
  };

  const newEditorState = EditorState.set(editorState, {
    decorator,
  });
  useEffect(() => {
    setEditorState(newEditorState);
  }, []);

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

  const promptForLink = (e: MouseEvent) => {
    e.preventDefault();
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = selection.getStartKey();
      const startOffset = selection.getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);

      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let url = "";
      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        url = linkInstance.getData().url;
      }

      setURL({
        showURLInput: true,
        urlValue: url,
      });
      editor.current!.focus();
    }
  };

  const editorStateWithLink = (
    e: KeyboardEvent<HTMLInputElement>
  ): EditorState => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();

    const contentStateWithEntity = contentState.createEntity(
      "LINK",
      "MUTABLE",
      { url: URL.urlValue }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    //apply entity
    let nextEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    //apply selection
    nextEditorState = RichUtils.toggleLink(
      nextEditorState,
      nextEditorState.getSelection(),
      entityKey
    );

    setURL({
      showURLInput: false,
      urlValue: "",
    });
    editor.current?.focus();
    return nextEditorState;
  };

  const URLInput = URL.showURLInput && (
    <div>
      <input
        type="text"
        className="inputLink"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setURL({ ...URL, urlValue: e.target.value })
        }
        value={URL.urlValue}
        placeholder="input link here"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const nextState = editorStateWithLink(e);
            setEditorState(nextState);
          }
        }}
      />
    </div>
  );

  return (
    <div className="RichEditor-root">
      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
        setURL={setURL}
      />

      <button onClick={promptForLink} id="addLinkButton">
        Link
      </button>

      {URLInput}

      <div className="RichEditor-editor">
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          placeholder="Tell a story..."
          ref={editor}
        />
      </div>
    </div>
  );
};
export default DraftEditor;
