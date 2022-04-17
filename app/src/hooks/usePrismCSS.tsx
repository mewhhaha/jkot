import { useCallback, useInsertionEffect } from "react";
import style from "~/styles/prims.css";
import Prism from "prismjs";

let counter = 0;

export const usePrismCSS = () => {
  useInsertionEffect(() => {
    if (counter === 0) {
      const css = document.createElement("style");
      css.innerText = style;
      document.head.appendChild(css);

      counter++;
      return () => {
        document.head.removeChild(css);
        counter--;
      };
    } else {
      counter++;
      return () => {
        counter--;
      };
    }
  });

  return useCallback((node: ParentNode) => {
    Prism.highlightAllUnder(node, true);
  }, []);
};
