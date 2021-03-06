import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  ErrorBoundaryComponent,
} from "@remix-run/cloudflare";
import styles from "./tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
  ];
};

export const meta: MetaFunction = () => {
  return {
    title: "jkot me; i fucked up",
    description:
      "This is the jkot me blog, with all the fancy details about my technology and life!",
  };
};

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        There was an unexpected error! Please try refreshing the page again.
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
