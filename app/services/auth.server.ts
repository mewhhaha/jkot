import { createCookie, createCookieSessionStorage } from "remix";
import { Authenticator } from "remix-auth";
import { Auth0Profile, Auth0Strategy } from "remix-auth-auth0";
import { CloudflareContext } from "~/types";

export const createAuthenticator = (
  context: CloudflareContext,
  request: Request
) => {
  const sessionCookie = createCookie("_session", {
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [context.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  });

  const sessionStorage = createCookieSessionStorage({
    cookie: sessionCookie,
  });

  const authenticator = new Authenticator<Auth0Profile>(sessionStorage);
  const auth0Strategy = new Auth0Strategy(
    {
      callbackURL:
        new URL(request.url).origin + "/" + context.AUTH0_CALLBACK_URL,
      clientID: context.AUTH0_CLIENT_ID,
      clientSecret: context.AUTH0_CLIENT_SECRET,
      domain: context.AUTH0_DOMAIN,
    },
    async ({ profile }) => {
      return profile;
    }
  );

  authenticator.use(auth0Strategy);

  return authenticator;
};
