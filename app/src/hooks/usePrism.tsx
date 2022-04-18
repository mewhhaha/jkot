import { useCallback, useEffect } from "react";
import style from "~/styles/prism.css";
import Prism from "~/styles/prism";

let counter = 0;
let css: HTMLElement;

export const usePrism = () => {
  useEffect(() => {
    if (css === undefined) {
      css = document.createElement("link");
      css.setAttribute("rel", "stylesheet");
      css.setAttribute("href", style);
    }

    if (counter === 0) {
      document.head.appendChild(css);
    }

    counter++;
    return () => {
      counter--;
      if (counter === 0) {
        document.head.removeChild(css);
      }
    };
  }, []);

  return useCallback((node: ParentNode) => {
    Prism.highlightAllUnder(node);
  }, []);
};
