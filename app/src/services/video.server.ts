import { invertTime } from "~/utils/date";

export function videoKeys(params: { date: Date; id: string }): {
  dateKey: `date#${number}#id#${string}`;
};

export function videoKeys(params: { date: Date }): {
  dateKey: `date#${number}#`;
};

export function videoKeys({ date, id }: { date?: Date; id?: string }): {
  dateKey?: string;
} {
  const dateKey =
    date && id ? `date#${invertTime(date.getTime())}#id#${id}` : undefined;

  return { dateKey };
}
