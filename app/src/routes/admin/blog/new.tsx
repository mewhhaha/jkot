import type { LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

export const action: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context }) => {
    const doid = context.ARTICLE_DO.newUniqueId();

    const settings = item(request, context, `article/${doid}`);

    await settings.put({
      slug: doid.toString(),
      id: doid.toString(),
      status: "unpublished",
    });

    return redirect(`/admin/blog/${doid}/edit`);
  });
