import type { LoaderFunction } from "@remix-run/cloudflare";
import { createAuthenticator } from "~/services/auth.server";
import type { CloudflareDataFunctionArgs } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(request, context);
  await authenticator.authenticate("auth0", request, {
    successRedirect: "/admin",
    failureRedirect: "/",
  });
};
