import { useInsertionEffect } from "react";
import style from "~/styles/prism.css";
import Prism from "prismjs";

let counter = 0;

const css = document.createElement("link");
css.setAttribute("rel", "stylesheet");
css.setAttribute("href", style);

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

  return Prism.highlightAllUnder;
};
