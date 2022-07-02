export class Settings implements DurableObject {
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;

    state.blockConcurrencyWhile(async () => {
      if ((await this.storage.get<Date>("created")) !== undefined) return;

      const now = new Date();
      await Promise.all([
        this.storage.put("created", now),
        this.storage.put("modified", now),
      ]);
    });
  }

  async list(_request: Request) {
    const list = await this.storage.list();
    const latest = Object.fromEntries([...list.entries()]);
    return new Response(JSON.stringify(latest), {
      headers: { "Content-Type": "application/json" },
    });
  }

  async get(request: Request) {
    const path = new URL(request.url).pathname.slice(1);

    const latest = await this.storage.get(path);
    return new Response(JSON.stringify(latest ?? {}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  async put(request: Request) {
    const path = new URL(request.url).pathname.slice(1);
    const json = await request.json();

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const transaction = [];

    transaction.push(this.storage.put("modified", now));
    transaction.push(this.storage.put(path, json));

    await Promise.all(transaction);

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async delete(request: Request) {
    const path = new URL(request.url).pathname.slice(1);

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const transaction = [];
    transaction.push(this.storage.put("modified", now));
    transaction.push(this.storage.delete(path));

    await Promise.all(transaction);

    return new Response(null);
  }

  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;

    switch (request.method) {
      case "GET": {
        if (path === "/") {
          return await this.list(request);
        } else {
          return this.get(request);
        }
      }
      case "DELETE": {
        if (path !== "/") {
          return await this.delete(request);
        }
        break;
      }
      case "PUT": {
        if (path !== "/") {
          return await this.put(request);
        }
        break;
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
