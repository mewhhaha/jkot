export class Article implements DurableObject {
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async websocket(request: Request) {
    return new Response("Not Found", { status: 404 });
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (request.method === "POST") {
      switch (url.pathname) {
        case "/websocket":
          this.websocket(request);
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
