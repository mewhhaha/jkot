import { Router } from "itty-router";
import { Env } from "./types";

const router = Router();

router.all("/articles/:id/websocket", async (request, env: Env) => {
  const id = request.params?.id;
  if (id === undefined) return new Response("Missing ID", { status: 422 });

  const doid = env.ARTICLE_DO.idFromString(id);
  const stub = env.ARTICLE_DO.get(doid);

  return stub.fetch(request as Request);
});

export default {
  fetch(request: Request, ...extra: any[]) {
    return router.handle(request, ...extra);
  },
};

export * from "./settings";
export * from "./article";
export * as rope from "./rope";
export * from "./types";
