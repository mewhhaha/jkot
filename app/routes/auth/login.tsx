import { ActionFunction } from "remix";
import { createAuthenticator } from "~/services/auth.server";
import { CloudflareDataFunctionArgs } from "~/types";

export const action: ActionFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs) => {
  const authenticator = createAuthenticator(request, context);
  await authenticator.authenticate("auth0", request, {
    successRedirect: "/",
    failureRedirect: "/",
  });
};
