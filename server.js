import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import { Settings, Article } from "./durable_objects/worker";

const state = () => ({
  blockConcurrencyWhile: (f) => {
    f();
  },
  storage: {
    o: {},
    get(key) {
      return this.o[key];
    },
    put(key, value) {
      this.o[key] = value;
    },
    list() {
      return new Map(Object.entries(this.o));
    },
  },
});

const durable = (internal) => {
  return {
    objects: {},
    idFromName(name) {
      return name;
    },
    idFromString(id) {
      return id;
    },
    newUniqueId() {
      return Math.floor(Math.random() * 1000000000);
    },
    get(name) {
      if (this.objects[name] === undefined) {
        this.objects[name] = {
          internal,
          fetch(...args) {
            const request = new Request(...args);
            return this.internal.fetch(request);
          },
        };
      }

      return this.objects[name];
    },
  };
};

const SETTINGS_DO = durable(new Settings(state()));
const ARTICLE_DO = durable(new Article(state()));

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
  // process.env.NODE_ENV === "production"
  //   ? context.env
  //   : { ...context.env, SETTINGS_DO, ARTICLE_DO },
});

export function onRequest(context) {
  return handleRequest(context);
}
