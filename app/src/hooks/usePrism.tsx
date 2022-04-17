import { useEffect, useRef } from "react";
import style from "~/styles/prism.css";
import Prism from "~/styles/prism";

let counter = 0;

let css: HTMLLinkElement;

export const usePrism = () => {
  useEffect(() => {
    if (css === undefined) {
      const el = document.createElement("link");
      el.setAttribute("rel", "stylesheet");
      el.setAttribute("href", style);
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
