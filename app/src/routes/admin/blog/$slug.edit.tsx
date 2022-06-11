import type { Content, Message } from "durable-objects";
import { useState, useEffect, Fragment } from "react";
import type { LoaderFunction } from "remix";
import { useNavigate } from "remix";
import { Form, Link, Outlet, useLoaderData } from "remix";
import { ArticleFull } from "~/components/ArticleFull";
import { useWebSocket } from "~/hooks/useWebSocket";
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import { diffs } from "~/utils/text";
import cx from "clsx";
import { Menu, RadioGroup, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { uploadImage } from "~/routes/images.$group/upload";
import { ImageAreaUpload, Textarea, Textbox } from "~/components/form";
import { Button } from "~/components/Button";
import type { KVImage } from "~/services/image.server";
import { createImageKey } from "~/services/image.server";
import { ocx } from "~/styles/cx";

type LoaderData = {
  articleId: string;
  published: boolean;
  defaultContent: Content;
  slug: string;
  socketURL: string;
  images: { created: string; url: string }[];
};

export const loader: LoaderFunction = (args) =>
  requireAuthentication(
    args,
    async ({ request, context, params }): Promise<LoaderData> => {
      const slug = params.slug === "empty" ? "" : params.slug;
      if (slug === undefined) {
        throw new Error("Invariant");
      }

      const settings = await item(request, context, `article/${slug}`).json();

      if (settings.id === undefined) {
        throw new Response("Not found", { status: 404 });
      }

      const articleItem = article(request, context, settings.id);

      const list = await context.IMAGE_KV.list<KVImage>({
        prefix: createImageKey({ group: settings.id }),
      });

      const images = await Promise.all(
        list.keys.map((id) => {
          return context.IMAGE_KV.get<KVImage>(id.name, "json");
        })
      );

      return {
        articleId: settings.id,
        published: settings.status === "published",
        slug,
        defaultContent: await articleItem.read(),
        socketURL: await articleItem.generate(),
        images: images
          .filter((i): i is KVImage => i !== null)
          .map(({ created, id }) => {
            return {
              created,
              url: `https://imagedelivery.net/${context.IMAGES_ID}/${id}/public`,
            };
          }),
      };
    }
  );

const ActionMenu: React.FC = () => {
  const { published, slug } = useLoaderData<LoaderData>();

  const items = [
    {
      to: `/admin/blog/${slug}/edit/publish`,
      name: "Publish Article",
    },
    {
      to: `/admin/blog/${slug}/edit/unpublish`,
      name: "Unpublish Article",
    },
    {
      to: `/admin/blog/${slug}/edit/change-slug`,
      name: "Change Slug",
    },
    {
      to: `/admin/blog/${slug}/edit/delete`,
      name: "Delete Article",
      destroy: true,
    },
  ];

  return (
    <span className="relative z-0 inline-flex rounded-md shadow-sm">
      <Link
        to={
          published
            ? `/admin/blog/${slug}/edit/unpublish`
            : `/admin/blog/${slug}/edit/publish`
        }
      >
        <button
          type="button"
          className={cx(
            "relative inline-flex items-center rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
            published
              ? "bg-white text-gray-700 hover:bg-gray-50"
              : "bg-orange-600 text-gray-50 hover:bg-orange-700"
          )}
        >
          {published ? "Unpublish Article" : "Publish Article"}
        </button>
      </Link>
      <Menu as="span" className="relative -ml-px block">
        <Menu.Button className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 -mr-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {items.map(({ to, name, destroy }) => {
                return (
                  <Menu.Item key={name}>
                    {({ active }) => (
                      <Link
                        to={to}
                        className={cx(
                          destroy
                            ? {
                                "bg-red-200 text-red-900": active,
                                "text-red-700": !active,
                              }
                            : {
                                "bg-gray-100 text-gray-900": active,
                                "text-gray-700": !active,
                              },
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        {name}
                      </Link>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </span>
  );
};

export default function Edit() {
  const navigate = useNavigate();
  const { images, articleId, socketURL, defaultContent } =
    useLoaderData<LoaderData>();
  const [content, setContent] = useState<Content>(defaultContent);

  const [socket, status] = useWebSocket(socketURL);

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
              body: prev.body.slice(0, from) + prev.body.slice(to),
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
    <section className="flex flex-grow justify-center">
      <div className="grid h-full w-full grid-cols-2">
        <div className="h-full w-full">
          <fieldset className="h-full" disabled={status !== "open"}>
            <div className="relative flex h-full flex-col p-4 shadow sm:overflow-hidden sm:rounded-md">
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <ActionMenu />
              </div>
              <div className="flex-grow space-y-6 bg-white py-6 px-4 sm:p-6">
                <div className="col-span-3">
                  <Textarea
                    label="Body"
                    name="body"
                    rows={10}
                    value={content.body}
                    placeholder="It all started with..."
                    description="The main text of the article."
                    onChange={(event) => {
                      const value = event.target.value;
                      const cursorPosition = event.currentTarget.selectionStart;
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
                <div className="col-span-3">
                  <Form
                    method="post"
                    onChange={async (event) => {
                      const fileFormData = new FormData(event.currentTarget);
                      await uploadImage(fileFormData, articleId);
                      navigate("images");
                    }}
                  >
                    <ImageAreaUpload label="Upload image" name="file" />
                  </Form>
                </div>
                <div className="col-span-3">
                  <Link
                    className="font-medium text-orange-600 hover:text-orange-500"
                    to="images"
                  >
                    <Button>Gallery</Button>
                  </Link>
                </div>
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

                  <dl className="col-span-3 grid grid-cols-1 gap-x-4 gap-y-8 sm:col-span-2 sm:grid-cols-2">
                    {(["created", "modified"] as const).map((field) => {
                      const date = new Date(content[field]).toDateString();
                      return (
                        <div key={field} className="sm:col-span-1">
                          <dt className="text-sm font-medium capitalize text-gray-500">
                            {field}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <time dateTime={date}>{date}</time>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>

                  <div className="col-span-3">
                    <RadioGroup
                      value={content.imageUrl}
                      onChange={(value) => {
                        send(["imageUrl", value]);
                        setContent((prev) => ({ ...prev, imageUrl: value }));
                      }}
                    >
                      <RadioGroup.Label className="block text-sm font-medium text-gray-700">
                        Title Image
                      </RadioGroup.Label>
                      <div className="flex flex-wrap gap-4">
                        {images.map(({ url }) => {
                          return (
                            <RadioGroup.Option value={url} key={url}>
                              {({ checked }) => {
                                return (
                                  <div
                                    className={ocx(
                                      "h-32 w-32 rounded-md border-2",
                                      checked
                                        ? "border-black"
                                        : "border-transparent"
                                    )}
                                  >
                                    <img
                                      src={url}
                                      className="rounded-md"
                                      alt={url}
                                    />
                                  </div>
                                );
                              }}
                            </RadioGroup.Option>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Textbox
                      label="Title Image Author"
                      name="imageauthor"
                      value={content.imageAuthor}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["imageAuthor", value]);
                        setContent((prev) => ({ ...prev, imageAuthor: value }));
                      }}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <Textbox
                      label="Title Image Alt"
                      name="imagealt"
                      value={content.imageAlt}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        send(["imageAlt", value]);
                        setContent((prev) => ({ ...prev, imageAlt: value }));
                      }}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
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
                </div>
              </div>
            </div>
          </fieldset>
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
      </div>
      <Outlet />
    </section>
  );
}
