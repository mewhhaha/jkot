import { useMatch } from "react-router";
import { Form, Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import cx from "clsx";
import React from "react";
import { createAuthenticator } from "~/services/auth.server";
import {
  CloudflareDataFunctionArgs,
  LinksSettings,
  ProfileSettings,
} from "~/types";
import * as settings from "~/services/settings.server";
import Banner from "~/images/Banner.jpg";

type LoaderData = {
  authed: boolean;
  links: LinksSettings;
  profile: ProfileSettings;
};

export const loader: LoaderFunction = async ({
  request,
  context,
}: CloudflareDataFunctionArgs): Promise<LoaderData> => {
  const authenticator = createAuthenticator(request, context);
  const user = await authenticator.isAuthenticated(request);

  const { links = {}, profile = {} } = await settings
    .all(request, context)
    .json();

  return {
    authed: user !== null,
    links,
    profile,
  };
};

const createNavigation = ({ github, twitter }: LinksSettings) => [
  {
    name: "Twitter",
    href: `https://twitter.com/${twitter}`,
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: `https://github.com/${github}`,
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

type NavLinkProps = {
  to: string;
};

const NavLink: React.FC<NavLinkProps> = ({ children, to }) => {
  const match = useMatch("/:page/*");
  const page = match?.params?.page ?? "";
  const active = `/${page}` === to;

  return (
    <Link
      className={cx(
        "flex h-full transform items-center border-b-4 border-transparent text-2xl font-light transition-transform hover:translate-y-0 hover:border-orange-400",
        active
          ? "translate-y-0 border-orange-400"
          : "translate-y-1 border-transparent"
      )}
      to={to}
    >
      {children}
    </Link>
  );
};

const NavButton: React.FC = ({ children }) => {
  return (
    <button
      type="submit"
      className="flex h-full translate-y-1 transform items-center border-b-4 border-transparent text-2xl font-light transition-transform hover:translate-y-0 hover:border-orange-400"
    >
      {children}
    </button>
  );
};

export default function HeaderTemplate() {
  const { authed, links, profile } = useLoaderData<LoaderData>();

  const navigation = createNavigation(links);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-auto">
      <header className="relative flex w-full flex-col bg-white">
        <div className="relative mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="flex justify-center text-base font-bold uppercase tracking-wide">
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                {`${profile.username}`} Blog
              </span>
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              jkot me; I fucked up!
            </p>
            <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500">
              {profile.about}
            </p>
          </div>
        </div>
      </header>
      <nav className="sticky top-0 z-10 flex h-12 w-full flex-none justify-end space-x-4 overflow-hidden border-b bg-white/70 px-2 pt-1 shadow-md backdrop-blur-md md:space-x-12 md:px-8">
        <NavLink to="/">Start</NavLink>
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/videos">Videos</NavLink>
        {authed ? (
          <>
            <NavLink to="/settings">Settings</NavLink>
            <Form action="/auth/logout" method="post">
              <NavButton>Logout</NavButton>
            </Form>
          </>
        ) : (
          <Form action="/auth/login" method="post">
            <NavButton>Login</NavButton>
          </Form>
        )}
      </nav>
      <main className="relative z-0 flex flex-grow bg-gray-100">
        <Outlet />
      </main>
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy;
              {`${new Date().getFullYear()} Jacob Ken Olof Torrång All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
