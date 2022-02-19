import { CloudflareContext } from "~/types";

type SettingsDO<A> = {
  get(): Promise<Response>;
  put(value: A): Promise<Response>;
};

export const svc = <A>(
  context: CloudflareContext,
  request: Request,
  name: string
): SettingsDO<A> => {
  const doid = context.SETTINGS_DO.idFromName(name);
  const stub = context.SETTINGS_DO.get(doid);

  return {
    get: () => {
      return stub.fetch(new URL(request.url).origin);
    },
    put: (value) => {
      return stub.fetch(new URL(request.url).origin, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    },
  };
};
