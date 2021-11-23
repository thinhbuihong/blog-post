import { convertFromRaw } from "draft-js";
import { convertToHTML } from "draft-convert";
import DOMPurify from "isomorphic-dompurify";

export const convertContentToHTML = (text: string) => {
  const rawContent = JSON.parse(text);
  const contentState = convertFromRaw(rawContent);
  let currentContentAsHTML = convertToHTML(contentState);

  return {
    __html: DOMPurify.sanitize(currentContentAsHTML),
  };
};
