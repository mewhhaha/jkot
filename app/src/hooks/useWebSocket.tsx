import { useState, useEffect, useRef } from "react";

export type WebSocketStatus =
  | "idle"
  | "error"
  | "closed"
  | "open"
  | "reconnecting";

export type UseWebSocketOptions = { reconnect: boolean; retries: number };

export const useWebSocket = (
  socketURL: string,
  { reconnect, retries }: UseWebSocketOptions = { reconnect: true, retries: 10 }
) => {
  const [status, setStatus] = useState<WebSocketStatus>("idle");
  const [socket, setSocket] = useState<WebSocket>();

  const reconnects = useRef(0);

  useEffect(() => {
    if (socket === undefined) {
      setSocket(new WebSocket(socketURL));
      return;
    }

    try {
      const handleError = () => {
        setStatus("error");
      };

      const handleClose = (ev: CloseEvent) => {
        console.log(ev.code);
        if (
          ![1000, 1005].includes(ev.code) &&
          reconnect &&
          reconnects.current <= retries
        ) {
          reconnects.current += 1;
          setStatus("reconnecting");
          setSocket(new WebSocket(socketURL));
        } else {
          setStatus("closed");
        }
      };

      const handleOpen = () => {
        setStatus("open");
        reconnects.current = 0;
      };

      socket.addEventListener("error", handleError);
      socket.addEventListener("close", handleClose);
      socket.addEventListener("open", handleOpen);

      return () => {
        socket.removeEventListener("error", handleError);
        socket.removeEventListener("close", handleClose);
        socket.removeEventListener("open", handleOpen);
        socket.close();
      };
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [reconnect, retries, setSocket, socket, socketURL]);

  return [socket, status] as const;
};
