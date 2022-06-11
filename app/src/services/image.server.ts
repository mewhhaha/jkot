import { invertTime } from "~/utils/date";

export type KVImage = { id: string; created: string };

export function createImageKey(params: { date: Date; group: string }): string;

export function createImageKey(params: { group: string }): string;

export function createImageKey({
  date,
  group,
}: {
  date?: Date;
  group: string;
}): string | undefined {
  const groupKey = `group#${group}`;
  const dateKey = date ? `date#${invertTime(date.getTime())}` : undefined;

  const key = [groupKey, dateKey].filter((x) => x !== undefined).join("#");

  return key;
}
