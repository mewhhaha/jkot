import { Router } from "itty-router";
import { Env } from "./types";

const router = Router();

router.all("/articles/:id/websocket", async (request, env: Env) => {
  const id = request.params?.id;
  if (id === undefined) return new Response("Missing ID", { status: 422 });

  const doid = env.ARTICLE_DO.idFromString(id);
  const stub = env.ARTICLE_DO.get(doid);

  return stub.fetch(request.url);
});

export default {
  fetch: router.handle,
};

export { Settings } from "./settings";
export { Article } from "./article";
