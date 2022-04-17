import { LoaderFunction } from "remix";
import { createAuthenticator } from "~/services/auth.server";
import { CloudflareDataFunctionArgs } from "~/types";

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
