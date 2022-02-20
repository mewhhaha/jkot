export class Settings implements DurableObject {
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async list(_request: Request) {
    const list = await this.storage.list();
    const latest = Object.fromEntries([...list.entries()]);
    return new Response(JSON.stringify(latest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async get(request: Request) {
    const path = new URL(request.url).pathname.slice(1);

    const latest = await this.storage.get(path);
    return new Response(JSON.stringify(latest ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async put(request: Request) {
    const path = new URL(request.url).pathname.slice(1);
    const json = await request.json();

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const transaction = [];
    if ((await this.storage.get<Date>("created")) === undefined) {
      transaction.push(this.storage.put("created", now));
    }

    transaction.push(this.storage.put("modified", now));
    transaction.push(this.storage.put(path, json));

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async fetch(request: Request) {
    const path = new URL(request.url).pathname;

    switch (request.method) {
      case "GET": {
        if (path === "/") {
          return this.list(request);
        } else {
          return this.get(request);
        }
      }
      case "PUT": {
        if (path !== "/") {
          return this.put(request);
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
