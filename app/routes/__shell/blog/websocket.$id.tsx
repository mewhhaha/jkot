import { LoaderFunction } from "remix";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    if (typeof params.id !== "string") {
      throw new Error("Expected string");
    }
    return await article(request, context, params.id).websocket();
  });
