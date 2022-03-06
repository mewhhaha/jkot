import type { Content, Message } from "durable-objects";
import * as rope from "rope";
import { useState, useEffect, useRef } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { ArticleFull } from "~/components/ArticleFull";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import { diffs, resolve } from "~/utils/text";

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

  const ref = useRef(rope.from(""));

  const socket = useWebsocket();

  useEffect(() => {
    socket?.addEventListener("message", (msg) => {
      try {
        const message: Message = JSON.parse(msg.data);
        switch (message[0]) {
          case "latest": {
            ref.current = rope.from(message[1].body);
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
            ref.current = rope.insert(ref.current, position, text);
            break;
          }

          case "c-remove": {
            const [from, to] = message[1];
            ref.current = rope.remove(ref.current, from, to);
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
          value={content.title}
          onChange={(event) => {
            const value = event.currentTarget.value;
            send(["title", value]);
            setContent((prev) => ({ ...prev, title: value }));
          }}
        />
        <input
          type="text"
          value={content.description}
          onChange={(event) => {
            const value = event.currentTarget.value;
            send(["description", value]);
            setContent((prev) => ({ ...prev, description: value }));
          }}
        />
        <dl>
          <dt>Created</dt>
          <dd>{content.created}</dd>
          <dt>Modified</dt>
          <dd>{content.modified}</dd>
          <dt>Category</dt>
          <dd aria-label={content?.category}>
            <input
              value={content?.category}
              onChange={(event) => {
                const value = event.currentTarget.value;
                send(["category", value]);
                setContent((prev) => ({ ...prev, category: value }));
              }}
            ></input>
          </dd>
        </dl>
        <textarea
          value={content.body}
          onChange={(event) => {
            const value = event.target.value;
            const cursorPosition = event.currentTarget.selectionStart;
            const messages = diffs(content.body, value, cursorPosition);

            messages.forEach(send);

            ref.current = resolve(ref.current, messages);

            setContent((prev) => ({
              ...prev,
              body: value,
            }));
          }}
        />
      </div>
      <div className="h-full w-full">
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
    </section>
  );
}
