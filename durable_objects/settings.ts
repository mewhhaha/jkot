export class Settings implements DurableObject {
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async get(request: Request) {
    const path = new URL(request.url).pathname;
    const latest = await this.storage.get(path);

    return new Response(JSON.stringify(latest ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async put(request: Request) {
    const path = new URL(request.url).pathname;
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
    switch (request.method) {
      case "GET":
        return this.get(request);
      case "PUT":
        return this.put(request);
    }

    return new Response("Not Found", { status: 404 });
  }
}
