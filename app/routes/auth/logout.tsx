import { ActionFunction } from "remix";
import { createAuthenticator } from "~/services/auth.server";
import { CloudflareDataFunctionArgs } from "~/types";

export const action: ActionFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(context, request);
  const url = new URL(`https://${context.AUTH0_DOMAIN}/v2/logout`);
  url.searchParams.set("client_id", context.AUTH0_CLIENT_ID);
  url.searchParams.set("returnTo", new URL(request.url).origin);

  return await authenticator.logout(request, {
    redirectTo: url.toString(),
  });
};
