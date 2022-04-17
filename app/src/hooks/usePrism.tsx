import { useRef } from "react";
import Prism from "prismjs";

export const usePrism = () => {
  return useRef((node: ParentNode) => {
    Prism.highlightAllUnder(node);
  }).current;
};
