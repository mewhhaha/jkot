import type { DataFunctionArgs } from "@remix-run/server-runtime";
import type { Content } from "durable-objects";

export type CloudflareDataFunctionArgs = Omit<DataFunctionArgs, "context"> & {
  context: CloudflareContext;
};

export type Video = {
  allowedOrigins: string[];
  created: string;
  duration: number;
  input: {
    height: number;
    width: number;
  };
  maxDurationSeconds: number;
  meta: Record<string, string>;
  modified: string;
  uploadExpiry: string;
  playback: {
    hls: string;
    dash: string;
  };
  preview: string;
  readyToStream: true;
  requireSignedURLs: true;
  size: number;
  status: {
    state: string;
    pctComplete: number;
    errorReasonCode: string;
    errorReasonText: string;
  };
  thumbnail: string;
  thumbnailTimestampPct: number;
  uid: string;
  liveInput: string;
  uploaded: string;
  watermark: {
    uid: string;
    size: number;
    height: number;
    width: number;
    created: string;
    downloadedFrom: string;
    name: string;
    opacity: number;
    padding: number;
    scale: number;
    position: string;
  };
  nft: {
    contract: string;
    token: number;
  };
};

export type CloudflareContext = {
  SESSION_SECRET: string;
  AUTH0_CALLBACK_URL: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DOMAIN: string;
  IMAGES_ACCESS_TOKEN: string;
  IMAGES_ID: string;
  STREAM_ACCESS_TOKEN: string;
  ACCOUNT_ID: string;
  SETTINGS_DO: DurableObjectNamespace;
  ARTICLE_DO: DurableObjectNamespace;
  ARTICLE_KV: KVNamespace;
  IMAGE_KV: KVNamespace;
  CACHE_KV: KVNamespace;
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
