import type { LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { requireAuthentication } from "~/services/auth.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async () => {
    return redirect("/admin/settings/profile");
  });
