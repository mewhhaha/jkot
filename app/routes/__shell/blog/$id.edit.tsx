import { useState, useEffect } from "react";
import { LoaderFunction, useLoaderData } from "remix";

export const loader: LoaderFunction = ({ params }) => {
  return params.id;
};

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
