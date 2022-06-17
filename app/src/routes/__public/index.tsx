import type { LoaderFunction } from "@remix-run/react";
import { redirect } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
  return redirect("/home");
};
