import type {
  VideoSettings,
  ArticleSettings,
  CloudflareContext,
  LinksSettings,
  ProfileSettings,
  StreamSettings,
} from "~/types";

type SettingsDO<A> = {
  get(): Promise<Response>;
  json(): Promise<A>;
  put(value: A): Promise<Response>;
  delete(): Promise<Response>;
};

type AllSettings = {
  links: LinksSettings;
  profile: ProfileSettings;
  stream: StreamSettings;
  created: string;
  modified: string;
} & Record<`article/${string}`, ArticleSettings> &
  Record<`video/${string}`, VideoSettings>;

export const isArticleKey = (key: string): key is `article/${string}` => {
  return key.startsWith("article/");
};

export const isVideoKey = (key: string): key is `video/${string}` => {
  return key.startsWith("video/");
};

export const all = <P extends "video" | "article" | undefined>(
  request: Request,
  context: CloudflareContext,
  prefix?: P
): Omit<
  SettingsDO<
    Partial<
      P extends undefined
        ? AllSettings
        : Record<
            `${P}/${string}`,
            AllSettings[Extract<keyof AllSettings, `${P}/${string}`>]
          >
    >
  >,
  "put" | "delete"
> => {
  const doid = context.SETTINGS_DO.idFromName("admin");
  const stub = context.SETTINGS_DO.get(doid);

  return {
    get: () => {
      return stub.fetch(`${new URL(request.url).origin}/list/${prefix ?? ""}`);
    },
    json: async () => {
      const response = await stub.fetch(new URL(request.url).origin);
      return response.json();
    },
  };
};

export const item = <
  Name extends keyof Omit<AllSettings, "created" | "modified">
>(
  request: Request,
  context: CloudflareContext,
  name: Name
): SettingsDO<AllSettings[Name]> => {
  const doid = context.SETTINGS_DO.idFromName("admin");
  const stub = context.SETTINGS_DO.get(doid);

  return {
    get: () => {
      return stub.fetch(new URL(request.url).origin);
    },
    json: async () => {
      const response = await stub.fetch(
        `${new URL(request.url).origin}/${name}`
      );
      return response.json();
    },
    delete: () => {
      if (!isArticleKey(name) && !isVideoKey(name)) {
        throw new Error("Can only delete articles");
      }

      return stub.fetch(`${new URL(request.url).origin}/${name}`, {
        method: "DELETE",
      });
    },
    put: (value) => {
      return stub.fetch(`${new URL(request.url).origin}/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    },
  };
};
