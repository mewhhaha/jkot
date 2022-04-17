import { useInsertionEffect, useRef } from "react";
import style from "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";

let counter = 0;

const css = (() => {
  const el = document.createElement("link");
  el.setAttribute("rel", "stylesheet");
  el.setAttribute("href", style);
  return el;
})();

export const usePrism = () => {
  useInsertionEffect(() => {
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
