import { LoaderFunction } from "remix";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    const settings = await item(
      request,
      context,
      `article/${params.slug}`
    ).json();

    if (settings.id === undefined) {
      throw new Response("Not found", { status: 404 });
    }
    return await article(request, context, settings.id).websocket();
  });
