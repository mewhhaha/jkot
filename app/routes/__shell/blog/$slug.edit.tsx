import { Content, Message } from "durable_objects/types";
import { useState, useEffect } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    const settings = await item(
      request,
      context,
      `article/${params.slug}`
    ).json();

    if (settings.id === undefined) {
      throw new Response("Not found", { status: 404 });
    }

    return article(request, context, settings.id).generate();
  });

const useWebsocket = () => {
  const socketURL = useLoaderData<string>();
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const socket = new WebSocket(socketURL);
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, [setSocket, socketURL]);

  return socket;
};

export default function Edit() {
  const [document, setDocument] = useState<Content>({
    title: "",
    category: "",
    description: "",
    created: "",
    modified: "",
    imageUrl: "",
    imageAlt: "",
    imageAuthor: "",
    body: "",
  });

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

  const send = (message: Message) => {
    socket?.send(JSON.stringify(message));
  };

  return (
    <section className="grid grid-cols-2">
      <div>
        <input
          type="text"
          value={document?.title}
          onChange={(event) => {
            const value = event.currentTarget.value;
            send(["title", value]);
            setDocument((prev) => ({ ...prev, title: value }));
          }}
        />
        <input
          type="text"
          value={document?.description}
          onChange={(event) => {
            const value = event.currentTarget.value;
            send(["description", value]);
            setDocument((prev) => ({ ...prev, description: value }));
          }}
        />
        <dl>
          <dt>Created</dt>
          <dd>{document?.created}</dd>
          <dt>Modified</dt>
          <dd>{document?.modified}</dd>
          <dt>Category</dt>
          <dd aria-label={document?.category}>
            <input
              value={document?.category}
              onChange={(event) => {
                const value = event.currentTarget.value;
                send(["category", value]);
                setDocument((prev) => ({ ...prev, category: value }));
              }}
            ></input>
          </dd>
        </dl>
        <textarea
          value={document?.body}
          onKeyDown={(event) => {
            const target = event.currentTarget;

            switch (event.key) {
              case "Delete": {
                if (target.selectionStart !== target.selectionEnd) {
                  send([
                    "c-remove",
                    [target.selectionStart, target.selectionEnd],
                  ]);
                } else {
                  send([
                    "c-remove",
                    [target.selectionStart, target.selectionStart + 1],
                  ]);
                }
              }

              case "Backspace": {
                if (target.selectionStart !== target.selectionEnd) {
                  send([
                    "c-remove",
                    [target.selectionStart, target.selectionEnd],
                  ]);
                } else {
                  send([
                    "c-remove",
                    [target.selectionStart - 1, target.selectionStart],
                  ]);
                }
              }

              default: {
                if (event.key.length !== 1) return;

                if (target.selectionStart !== target.selectionEnd) {
                  send([
                    "c-remove",
                    [target.selectionStart, target.selectionEnd],
                  ]);
                }
                send(["c-add", [target.selectionStart, event.key]]);
                return;
              }
            }
          }}
          onPasteCapture={(event) => {
            if (event.clipboardData.files.length > 0) return;

            const target = event.currentTarget;
            if (target.selectionStart !== target.selectionEnd) {
              send(["c-remove", [target.selectionStart, target.selectionEnd]]);
            }

            send([
              "c-add",
              [target.selectionStart, event.clipboardData.getData("Text")],
            ]);
          }}
          onChange={(event) => {
            setDocument((prev) => ({
              ...prev,
              body: event.currentTarget.value,
            }));
          }}
        />
      </div>
      <div>
        <h1></h1>
        <p></p>
      </div>
    </section>
  );
}
