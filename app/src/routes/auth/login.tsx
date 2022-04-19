import type { LoaderFunction } from "remix";
import { createAuthenticator } from "~/services/auth.server";
import type { CloudflareDataFunctionArgs } from "~/types";

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(request, context);
  const url = new URL(request.url);
  await authenticator.authenticate("auth0", request, {
    successRedirect: url.searchParams.get("callback") ?? "/admin",
    failureRedirect: "/",
  });
};
