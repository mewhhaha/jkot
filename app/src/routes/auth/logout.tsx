import type { ActionFunction } from "@remix-run/cloudflare";
import { createAuthenticator } from "~/services/auth.server";
import type { CloudflareDataFunctionArgs } from "~/types";

export const action: ActionFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(request, context);
  const url = new URL(`https://${context.AUTH0_DOMAIN}/v2/logout`);
  url.searchParams.set("client_id", context.AUTH0_CLIENT_ID);
  url.searchParams.set("returnTo", new URL(request.url).origin);

  return await authenticator.logout(request, {
    redirectTo: url.toString(),
  });
};
