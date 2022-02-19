import { DataFunctionArgs } from "@remix-run/server-runtime";

export type CloudflareDataFunctionArgs = Omit<DataFunctionArgs, "context"> & {
  context: CloudflareContext;
};

export type CloudflareContext = {
  SESSION_SECRET: string;
  AUTH0_CALLBACK_URL: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DOMAIN: string;
  STREAM_KV: KVNamespace;
  VIDEOS_KV: KVNamespace;
  USER_LOOKUP_KV: KVNamespace;
  USER_KV: KVNamespace;
  USER_DO: DurableObjectNamespace;
  CF_API_TOKEN: string;
  CF_ACCOUNT_ID: string;
};
