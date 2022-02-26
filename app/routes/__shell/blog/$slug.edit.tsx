import { useState, useEffect } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    const article = await item(
      request,
      context,
      `article/${params.slug}`
    ).json();
    if (article.id === undefined)
      return new Response("Not found", { status: 404 });

    return article.id;
  });

const useWebsocket = () => {
  const id = useLoaderData<string>();
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const host = new URL(window.location.href).host;
    const socket = new WebSocket(`wss://${host}/write/websocket/${id}`);
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, [id, setSocket]);

  return socket;
};

export default function Edit() {
  const [document, setDocument] = useState<string>();
  const socket = useWebsocket();

  useEffect(() => {
    socket?.addEventListener("message", (msg) => {
      try {
        const [t, data] = JSON.parse(msg.data);
        switch (t) {
          case "latest": {
            setDocument(data);
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }
    });
  }, [socket]);

  return <div>{document}</div>;
}
