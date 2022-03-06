import type { Message } from "durable-objects";
import * as rope from "rope";
import type { Rope } from "rope";
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

export const resolve = (body: Rope, messages: Message[]) => {
  for (const message of messages) {
    switch (message[0]) {
      case "c-add": {
        const [position, text] = message[1];
        body = rope.insert(body, position, text);
        break;
      }

      case "c-remove": {
        const [from, to] = message[1];
        body = rope.remove(body, from, to);
        break;
      }
    }
  }

  return body;
};
