import { CloudflareContext } from "~/types";

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
    destroy: async () => {
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
