import type { CloudflareContext } from "~/types";
import type { Content } from "durable-objects";
import { invertTime } from "~/utils/date";

type ArticleDO = {
  read(): Promise<Content>;
  destroy(): Promise<Response>;
  generate(): Promise<string>;
};

export const article = (
  request: Request,
  context: CloudflareContext,
  id: string
): ArticleDO => {
  const doid = context.ARTICLE_DO.idFromString(id);
  const stub = context.ARTICLE_DO.get(doid);

  return {
    read: async () => {
      const response = await stub.fetch(`${new URL(request.url).origin}/read`);
      return response.json();
    },
    destroy: () => {
      return stub.fetch(`${new URL(request.url).origin}/destroy`, {
        method: "DELETE",
      });
    },
    generate: async () => {
      const response = await stub.fetch(
        `${new URL(request.url).origin}/generate`,
        { method: "POST" }
      );
      return response.text();
    },
  };
};

export function articleKeys(params: { date: Date; slug: string }): {
  dateKey: `date#${number}#slug#${string}`;
  slugKey: `slug#${string}`;
};

export function articleKeys(params: { slug: string }): {
  slugKey: `slug#${string}`;
};

export function articleKeys({ date, slug }: { date?: Date; slug?: string }): {
  dateKey?: string;
  slugKey?: string;
} {
  const dateKey = date
    ? `date#${invertTime(date.getTime())}#slug#${slug}`
    : undefined;
  const slugKey = slug ? `slug#${slug}` : undefined;

  return { dateKey, slugKey };
}
