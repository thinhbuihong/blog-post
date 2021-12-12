import { DraftStyleMap } from "draft-js";

// Custom overrides for "code" style.
export const styleMap: DraftStyleMap = {
  CODE: {
    // backgroundColor: 'red',
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};
