import { useEffect, useRef } from "react";
import style from "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";

let counter = 0;

let css: HTMLLinkElement;

export const usePrism = () => {
  useEffect(() => {
    if (css === undefined) {
      const el = document.createElement("link");
      el.setAttribute("rel", "stylesheet");
      el.setAttribute("href", style);
      el.setAttribute("type", "text/css");
      el.setAttribute("media", "all");
      css = el;
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

  return useRef((node: ParentNode) => {
    Prism.highlightAllUnder(node);
  }).current;
};
