import type {
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
} & Record<`article/${string}`, ArticleSettings>;

export const isArticleKey = (key: string): key is `article/${string}` => {
  return key.startsWith("article/");
};

export const all = (
  request: Request,
  context: CloudflareContext
): Omit<SettingsDO<Partial<AllSettings>>, "put" | "delete"> => {
  const doid = context.SETTINGS_DO.idFromName("admin");
  const stub = context.SETTINGS_DO.get(doid);

  return {
    get: () => {
      return stub.fetch(new URL(request.url).origin);
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
      if (!isArticleKey(name)) {
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
