import { CharacterMetadata, ContentBlock, ContentState } from "draft-js";
import { Component } from "react";

interface linkEntityProps {
  contentState: ContentState;
  children: Component;
  entityKey: string;
}

const LinkEntity = ({ contentState, entityKey, children }: linkEntityProps) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a href={url} style={style.link}>
      {children}
    </a>
  );
};

export function findLinkEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  contentBlock.findEntityRanges((character: CharacterMetadata): boolean => {
    const entityKey = character.getEntity();
    return (
      entityKey != null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}

const style = {
  link: {
    color: "#3b5998",
    textDecoration: "underline",
    cursor: "pointer",
  },
};
export default LinkEntity;
