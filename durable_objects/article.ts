import { Env, Content, Message } from "./types";
import * as rope from "rope";
import { Rope } from "rope";

const byteStringToUint8Array = (byteString: string) => {
  const ui = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; ++i) {
    ui[i] = byteString.charCodeAt(i);
  }
  return ui;
};

export class Article implements DurableObject {
  storage: DurableObjectStorage;
  sessions: WebSocket[];
  env: Env;
  id: string | DurableObjectId;

  constructor(state: DurableObjectState, env: Env) {
    this.storage = state.storage;
    this.sessions = [];
    this.id = state.id;
    this.env = env;

    state.blockConcurrencyWhile(async () => {
      if ((await this.storage.get<Date>("created")) !== undefined) return;

      const encoder = new TextEncoder();
      const secret = encoder.encode(crypto.randomUUID());

      const now = new Date();
      await Promise.all([
        this.storage.put("secret", secret),
        this.storage.put("created", now),
        this.storage.put("modified", now),
      ]);
    });
  }

  broadcast(origin: WebSocket, message: string) {
    this.sessions = this.sessions.filter((session) => {
      if (session === origin) return true;
      try {
        session.send(message);
        return true;
      } catch (err) {
        return false;
      }
    });
  }

  async getContent(): Promise<Content> {
    const title = this.storage.get<string>("title");
    const category = this.storage.get<string>("category");
    const description = this.storage.get<string>("description");
    const created = this.storage.get<string>("created");
    const modified = this.storage.get<string>("modified");
    const imageUrl = this.storage.get<string>("imageUrl");
    const imageAlt = this.storage.get<string>("imageAlt");
    const imageAuthor = this.storage.get<string>("imageAuthor");
    const body = this.storage.get<Rope>("body");

    return {
      title: (await title) ?? "",
      category: (await category) ?? "",
      description: (await description) ?? "",
      created: (await created) ?? "",
      modified: (await modified) ?? "",
      imageUrl: (await imageUrl) ?? "",
      imageAlt: (await imageAlt) ?? "",
      imageAuthor: (await imageAuthor) ?? "",
      body: await body.then(rope.toString),
    };
  }

  async connect(websocket: WebSocket) {
    websocket.accept();

    this.sessions.push(websocket);

    const latest = await this.getContent();

    websocket.send(JSON.stringify(["latest", latest]));

    websocket.addEventListener("message", async (msg) => {
      const message: Message = JSON.parse(msg.data as string);
      const now = new Date();

      this.broadcast(websocket, msg.data as string);

      switch (message[0]) {
        case "title":
        case "imageUrl":
        case "imageAlt":
        case "imageAuthor":
        case "category":
        case "description": {
          await Promise.all([
            this.storage.put(message[0], message[1]),
            this.storage.put("modified", now),
          ]);
          break;
        }
        case "c-add": {
          let body = await this.storage.get<Rope>("body");
          if (body === undefined) {
            body = rope.from("");
          }

          const [position, text] = message[1];
          const next = rope.insert(body, position, text);

          await Promise.all([
            this.storage.put("body", next),
            this.storage.put("modified", now),
          ]);
          break;
        }

        case "c-remove": {
          let body = await this.storage.get<Rope>("body");
          if (body === undefined) {
            body = rope.from("");
          }

          const [from, to] = message[1];
          const next = rope.remove(body, from, to);

          await Promise.all([
            this.storage.put("body", next),
            this.storage.put("modified", now),
          ]);
          break;
        }
      }
    });
  }

  async websocket(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 400 });
    }

    let pair = new WebSocketPair();

    await this.connect(pair[1]);

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async generate(_request: Request) {
    const encoder = new TextEncoder();

    const minute = 1000 * 60;
    const expiry = Date.now() + minute;

    const url = new URL(
      `wss://${this.env.ORIGIN}/articles/${this.id}/websocket`
    );
    url.searchParams.append("expiry", expiry.toString());

    const secret = await this.storage.get<Uint8Array>("secret");

    if (!secret) {
      return new Response(null, { status: 403 });
    }

    const key: CryptoKey = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(url.pathname + "@" + expiry)
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(mac)));

    url.searchParams.append("mac", base64);

    return new Response(url.toString());
  }

  async verify(request: Request) {
    const encoder = new TextEncoder();

    const url = new URL(request.url);
    const expiry = url.searchParams.get("expiry");
    const mac = url.searchParams.get("mac");

    if (expiry === null || mac === null) {
      return new Response("Missing query parameter", { status: 403 });
    }

    const secret = await this.storage.get<Uint8Array>("secret");
    if (!secret) {
      return new Response(null, { status: 403 });
    }

    const key: CryptoKey = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      byteStringToUint8Array(atob(mac)),
      encoder.encode(url.pathname + "@" + expiry)
    );

    if (!verified) {
      return new Response("Invalid MAC", { status: 403 });
    }

    if (Date.now() > Number(expiry)) {
      const body = `URL expired at ${new Date(expiry)}`;
      return new Response(body, { status: 403 });
    }

    return this.websocket(request);
  }

  async read(_request: Request) {
    return new Response(JSON.stringify(this.getContent()));
  }

  async destroy(_request: Request) {
    await this.storage.deleteAll();
    return new Response("ok");
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Signed endpoint
    if (path.endsWith("/websocket")) {
      return this.verify(request);
    }

    switch (request.method) {
      case "GET": {
        if (path === "/read") {
          return this.read(request);
        }
      }
      case "DELETE": {
        if (path === "/destroy") {
          return this.destroy(request);
        }
      }
      case "POST": {
        if (path === "/generate") {
          return this.generate(request);
        }
      }
    }

    return new Response(null, { status: 403 });
  }
}
