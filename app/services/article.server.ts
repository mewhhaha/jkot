import { CloudflareContext } from "~/types";

type ArticleDO = {
  read(): Promise<Content>;
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
    generate: async () => {
      const response = await stub.fetch(
        `${new URL(request.url).origin}/generate`
      );
      return response.text();
    },
  };
};
