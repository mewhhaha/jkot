import { useEffect, useState } from "react";

export type WebSocketStatus = "idle" | "error" | "closed" | "open";

export const useWebSocket = (socketURL: string) => {
  const [status, setStatus] = useState<WebSocketStatus>("idle");
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const socket = new WebSocket(socketURL);
    const handleError = () => {
      setStatus("error");
    };

    const handleClose = () => {
      setStatus("closed");
    };

    const handleOpen = () => {
      setStatus("open");
    };

    socket.addEventListener("error", handleError);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("open", handleOpen);

    setSocket(socket);
    return () => {
      socket.close();
      socket.removeEventListener("error", handleError);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("open", handleOpen);
    };
  }, [setSocket, socketURL]);

  return [socket, status] as const;
};
