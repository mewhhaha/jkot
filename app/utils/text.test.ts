import { Message } from "durable-objects";
import * as rope from "rope";
import { test, expect } from "vitest";
import { diffs, resolve } from "./text";

// Mock backend from article durable object
const receive = (original: string, messages: Message[]) => {
  let body = rope.from(original);
  return rope.toString(resolve(body, messages));
};

test("Insert from nothing", () => {
  const from = "";
  const to = "hello world";
  const actions = diffs(from, to, 0);

  expect(receive(from, actions)).toEqual(to);
});

test("Insert in middle", () => {
  const from = "hello world";
  const to = "hello my world";
  const actions = diffs(from, to, "hello my ".length - 1);

  expect(receive(from, actions)).toEqual(to);
});

test("Delete all", () => {
  const from = "hello world";
  const to = "";
  const actions = diffs(from, to, "hello world".length - 1);

  expect(receive(from, actions)).toEqual(to);
});

test("Delete in middle", () => {
  const from = "hello world";
  const to = "hell world";
  const actions = diffs(from, to, "hell".length - 1);

  expect(receive(from, actions)).toEqual(to);
});
