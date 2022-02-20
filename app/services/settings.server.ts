import {
  CloudflareContext,
  LinksSettings,
  ProfileSettings,
  StreamSettings,
} from "~/types";

type SettingsDO<A> = {
  get(): Promise<Response>;
  json(): Promise<A>;
  put(value: A): Promise<Response>;
};

type AllSettings = {
  links: LinksSettings;
  profile: ProfileSettings;
  stream: StreamSettings;
};

export const svc = <Name extends keyof AllSettings>(
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
      const response = await stub.fetch(`${new URL(request.url).origin}/name`);
      return response.json();
    },
    put: (value) => {
      return stub.fetch(`${new URL(request.url).origin}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    },
  };
};
