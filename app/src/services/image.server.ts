import { invertTime } from "~/utils/date";

export type KVImage = { id: string; created: string };

export function imageKeys(params: { date: Date; group: string }): {
  dateKey: string;
};
export function imageKeys({ date, group }: { date?: Date; group?: string }): {
  dateKey?: string;
} {
  const dateKey =
    date && group
      ? `group#${group}date#${invertTime(date.getTime())}`
      : undefined;

  return { dateKey };
}
