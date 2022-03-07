import { overrideTailwindClasses } from "tailwind-override";
import cx from "clsx";

export const ocx = (...args: Parameters<typeof cx>) =>
  overrideTailwindClasses(cx(...args));

export { cx };
