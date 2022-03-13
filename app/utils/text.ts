import type { Message } from "durable-objects";
import fastDiff from "fast-diff";

export const diffs = (
  previous: string,
  current: string,
  cursorPosition: number
): Message[] => {
  const fds = fastDiff(previous, current, cursorPosition);

  const actions: Message[] = [];
  let length = 0;
  for (const [t, s] of fds) {
    switch (t) {
      case fastDiff.INSERT: {
        actions.push(["c-add", [length, s]]);
        length += s.length;
        break;
      }

      case fastDiff.DELETE: {
        actions.push(["c-remove", [length, length + s.length]]);
        break;
      }
      case fastDiff.EQUAL: {
        length += s.length;
        break;
      }
    }
  }

  return actions;
};

const WPM = 200;
export const readingTime = (body: string) =>
  Math.max(Math.floor(body.split(" ").length / WPM), 1);
