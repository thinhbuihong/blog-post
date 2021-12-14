import { convertFromRaw } from "draft-js";
import { convertToHTML } from "draft-convert";
import DOMPurify from "isomorphic-dompurify";

export const convertContentToHTML = (text: string) => {
  const rawContent = JSON.parse(text);
  const contentState = convertFromRaw(rawContent);
  let currentContentAsHTML = convertToHTML({
    entityToHTML: (entity, originalText) => {
      if (entity.type === "LINK") {
        return (
          <a
            href={entity.data.url}
            style={{ color: "blue", textDecoration: "underline" }}
            target="_blank"
          >
            {originalText}
          </a>
        );
      }

      return originalText;
    },
  })(contentState);

  return {
    __html: DOMPurify.sanitize(currentContentAsHTML),
  };
};
