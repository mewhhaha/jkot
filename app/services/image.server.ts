import { invertTime } from "~/utils/date";

export type KVImage = { id: string; created: string };

export function imageKeys(params: { date: Date }): {
  dateKey: string;
};
export function imageKeys({ date }: { date?: Date }): {
  dateKey?: string;
} {
  const dateKey = date ? `date#${invertTime(date.getTime())}` : undefined;

  return { dateKey };
}
