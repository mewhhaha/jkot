import type { Content, Message } from "durable-objects";
import { useState, useEffect } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { ArticleFull } from "~/components/ArticleFull";
import { Textarea, Textbox } from "~/components/form";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import { diffs } from "~/utils/text";

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

type WebSocketStatus = "idle" | "error" | "closed" | "open";

const useWebSocket = () => {
  const socketURL = useLoaderData<string>();
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

export default function Edit() {
  const [content, setContent] = useState<Content>({
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

  const [socket, status] = useWebSocket();

  useEffect(() => {
    if (socket === undefined) return;

    const handleMessage = (msg: MessageEvent<string>) => {
      try {
        const message: Message = JSON.parse(msg.data);
        switch (message[0]) {
          case "latest": {
            setContent(message[1]);
            break;
          }
          case "title":
          case "imageUrl":
          case "category":
          case "description": {
            setContent((prev) => ({ ...prev, [message[0]]: message[1] }));
            break;
          }
          case "c-add": {
            const [position, text] = message[1];
            setContent((prev) => ({
              ...prev,
              body:
                prev.body.slice(0, position) + text + prev.body.slice(position),
            }));
            break;
          }

          case "c-remove": {
            const [from, to] = message[1];
            setContent((prev) => ({
              ...prev,
              body: prev.body.slice(0, from) + prev.body.slice(from + to),
            }));
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const send = (message: Message) => {
    socket?.send(JSON.stringify(message));
  };

  return (
    <section className="flex flex-grow">
      <div className="grid h-full w-full max-w-7xl grid-cols-2">
        <div>
          <fieldset disabled={status !== "open"}>
            <div className="relative shadow sm:overflow-hidden sm:rounded-md">
              <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3 sm:col-span-2">
                    <Textbox
                      label="Category"
                      name="username"
                      value={content.category}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["category", value]);
                        setContent((prev) => ({ ...prev, category: value }));
                      }}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Textbox
                      label="Title"
                      name="title"
                      value={content.title}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["title", value]);
                        setContent((prev) => ({ ...prev, title: value }));
                      }}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Textarea
                      label="Description"
                      name="description"
                      value={content.description}
                      placeholder="This is..."
                      description="Brief description for your article."
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["description", value]);
                        setContent((prev) => ({ ...prev, description: value }));
                      }}
                    />
                  </div>

                  <dl className="col-span-3 grid grid-cols-1 gap-x-4 gap-y-8 sm:col-span-2 sm:grid-cols-2">
                    {(["created", "modified"] as const).map((field) => {
                      return (
                        <div key={field} className="sm:col-span-1">
                          <dt className="text-sm font-medium capitalize text-gray-500">
                            {field}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {content[field]}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>

                  <div className="col-span-6 sm:col-span-2">
                    <Textarea
                      label="Description"
                      name="description"
                      value={content.description}
                      placeholder="This is..."
                      description="Brief description for your article."
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["description", value]);
                        setContent((prev) => ({ ...prev, description: value }));
                      }}
                    />
                  </div>

                  <div className="col-span-3">
                    <Textarea
                      label="Body"
                      name="body"
                      value={content.body}
                      placeholder="It all started with..."
                      description="The main text of the article."
                      onChange={(event) => {
                        const value = event.target.value;
                        const cursorPosition =
                          event.currentTarget.selectionStart;
                        const messages = diffs(
                          content.body,
                          value,
                          cursorPosition
                        );

                        messages.forEach(send);

                        setContent((prev) => ({
                          ...prev,
                          body: value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </div>
          </fieldset>
        </div>
        <div>
          <ArticleFull
            title={content.title}
            category={content.category}
            description={content.description}
            imageUrl={content.imageUrl}
            imageAlt={content.imageAlt}
            imageAuthor={content.imageAuthor}
          >
            {content.body}
          </ArticleFull>
        </div>
      </div>
    </section>
  );
}
