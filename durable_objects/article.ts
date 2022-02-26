type A = {
  title: "Boost your conversion rate";
  href: "#";
  category: { name: "Article"; href: "#" };
  description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto accusantium praesentium eius, ut atque fuga culpa, similique sequi cum eos quis dolorum.";
  date: "Mar 16, 2020";
  datetime: "2020-03-16";
  imageUrl: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80";
  readingTime: "6 min";
  author: {
    name: "Roel Aufderehar";
    href: "#";
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };
};

export class Article implements DurableObject {
  storage: DurableObjectStorage;
  sessions: WebSocket[];

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
    this.sessions = [];

    state.blockConcurrencyWhile(async () => {
      if ((await this.storage.get<Date>("created")) !== undefined) return;

      const now = new Date();
      await Promise.all([
        this.storage.put("created", now),
        this.storage.put("modified", now),
      ]);
    });
  }

  broadcast(message: string) {
    this.sessions = this.sessions.filter((session) => {
      try {
        session.send(message);
        return true;
      } catch (err) {
        return false;
      }
    });
  }

  async connect(websocket: WebSocket) {
    websocket.accept();

    const latest = await this.storage.list();

    websocket.send(
      JSON.stringify(["latest", Object.fromEntries([...latest.entries()])])
    );

    websocket.addEventListener("message", async (msg) => {
      const [t, data] = JSON.parse(msg.data as string);
      const now = new Date();

      switch (t) {
        case "title":
        case "imageUrl":
        case "description":
        case "body": {
          this.storage.put(t, data);
          this.storage.put("modified", now);
          this.broadcast(JSON.stringify([t, data, now]));
          break;
        }
      }
    });
  }

  async websocket(request: Request) {
    if (request.headers.get("Upgrade") != "websocket") {
      return new Response("expected websocket", { status: 400 });
    }

    let pair = new WebSocketPair();

    await this.connect(pair[1]);

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/websocket":
        return this.websocket(request);
    }

    return new Response("Not Found", { status: 404 });
  }
}
