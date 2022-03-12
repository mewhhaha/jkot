import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Content } from "durable-objects";

export type CloudflareDataFunctionArgs = Omit<DataFunctionArgs, "context"> & {
  context: CloudflareContext;
};

export type CloudflareContext = {
  SESSION_SECRET: string;
  AUTH0_CALLBACK_URL: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DOMAIN: string;
  SETTINGS_DO: DurableObjectNamespace;
  ARTICLE_DO: DurableObjectNamespace;
  ARTICLE_KV: KVNamespace;
};

export type LinksSettings = {
  github?: string;
  twitter?: string;
};

export type ProfileSettings = {
  username?: string;
  about?: string;
  photo?: string;
  coverphoto?: string;
};

export type StreamSettings = {
  id?: string;
  title?: string;
  category?: string;
};

export type ArticleSettings = {
  slug?: string;
  id?: string;
  status?: "published" | "unpublished";
  published?: string;
};

export type PublishedContent = Content & {
  published: string;
  slug: string;
  author: string;
  authorImage: string;
  authorWebsite: string;
};

export type UnpublishedContent = Content & {
  slug: string;
  published?: string;
  status: "published" | "unpublished";
};
