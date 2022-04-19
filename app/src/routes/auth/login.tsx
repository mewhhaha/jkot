import type { LoaderFunction } from "remix";
import { createAuthenticator } from "~/services/auth.server";
import type { CloudflareDataFunctionArgs } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const url = new URL(request.url);
  const callbackURL = url.origin + "/" + url.searchParams.get("callback");
  const authenticator = createAuthenticator(request, context, callbackURL);
  await authenticator.authenticate("auth0", request, {
    successRedirect: "/admin",
    failureRedirect: "/",
  });
};
