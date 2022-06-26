import type { Content, Message, TextInputMessage } from "durable-objects";
import type { ChangeEvent } from "react";
import { useState, useEffect, Fragment, useRef, useCallback } from "react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
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
import { RefreshIcon } from "@heroicons/react/outline";

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
              url: `https://jkot.me/cdn-cgi/imagedelivery/${context.IMAGES_ID}/${id}/public`,
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
  const { images, articleId, socketURL, defaultContent } =
    useLoaderData<LoaderData>();
  const [content, setContent] = useState<Content>(defaultContent);
  const [preview, setPreview] = useState<Content>(content);
  const navigate = useNavigate();

  const contentRef = useRef(content);
  contentRef.current = content;

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

  const send = useCallback(
    (message: Message) => {
      socket?.send(JSON.stringify(message));
    },
    [socket]
  );

  const handleChangeEvent = useCallback(
    (
      field: TextInputMessage[0],
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = event.currentTarget.value;
      send([field, value]);
      setContent((prev) => ({ ...prev, [field]: value }));
    },
    [send]
  );

  const handleChangeValue = useCallback(
    (field: TextInputMessage[0], value: string) => {
      send([field, value]);
      setContent((prev) => ({ ...prev, [field]: value }));
    },
    [send]
  );

  return (
    <section className="flex flex-grow justify-center">
      <div className="relative grid h-full w-full grid-cols-1 md:grid-cols-2">
        <div className="h-full w-full">
          <fieldset className="h-full" disabled={status !== "open"}>
            <div className="relative flex h-full flex-col p-4 md:overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 text-right md:px-6">
                <ActionMenu />
              </div>
              <div className="grid flex-grow auto-rows-min grid-cols-3 space-y-6 bg-white py-6 px-4 md:p-6">
                <div className="col-span-3">
                  <Textarea
                    label="Body"
                    name="body"
                    rows={10}
                    value={content.body}
                    placeholder="It all started with..."
                    description="The main text of the article."
                    onChange={useCallback(
                      (event: ChangeEvent<HTMLTextAreaElement>) => {
                        const value = event.target.value;
                        const cursorPosition =
                          event.currentTarget.selectionStart;
                        const messages = diffs(
                          contentRef.current.body,
                          value,
                          cursorPosition
                        );

                        messages.forEach(send);

                        setContent((prev) => ({
                          ...prev,
                          body: value,
                        }));
                      },
                      [send]
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <Form
                    method="post"
                    onChange={useCallback(
                      async (event: ChangeEvent<HTMLFormElement>) => {
                        const fileFormData = new FormData(event.currentTarget);
                        await uploadImage(fileFormData, articleId);
                        navigate(".", { replace: true });
                      },
                      [articleId, navigate]
                    )}
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
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  <div className="col-span-3 md:col-span-2">
                    <Textbox
                      label="Category"
                      name="username"
                      value={content.category}
                      onChange={useCallback(
                        (value: ChangeEvent<HTMLInputElement>) =>
                          handleChangeEvent("category", value),
                        [handleChangeEvent]
                      )}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Textbox
                      label="Title"
                      name="title"
                      value={content.title}
                      onChange={useCallback(
                        (value: ChangeEvent<HTMLInputElement>) =>
                          handleChangeEvent("title", value),
                        [handleChangeEvent]
                      )}
                    />
                  </div>

                  <dl className="col-span-3 grid grid-cols-1 gap-x-4 gap-y-8 md:col-span-2 md:grid-cols-2">
                    {(["created", "modified"] as const).map((field) => {
                      const date = new Date(content[field]).toDateString();
                      return (
                        <div key={field} className="md:col-span-1">
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
                      defaultValue={content.imageUrl}
                      onChange={useCallback(
                        (value: string) => handleChangeValue("imageUrl", value),
                        [handleChangeValue]
                      )}
                    >
                      <RadioGroup.Label className="block text-sm font-medium text-gray-700">
                        Title Image
                      </RadioGroup.Label>
                      <div className="mt-1 flex flex-wrap gap-4">
                        {images.length === 0 && (
                          <RadioImage
                            url="https://images.unsplash.com/photo-1546913199-55e06682967e?ixlib=rb-1.2.1&auto=format&fit=crop&crop=focalpoint&fp-x=.735&fp-y=.55&w=1184&h=1376&q=80"
                            checked
                          />
                        )}
                        {images.map(({ url }) => {
                          return (
                            <RadioGroup.Option value={url} key={url}>
                              {({ checked }) => {
                                return (
                                  <RadioImage url={url} checked={checked} />
                                );
                              }}
                            </RadioGroup.Option>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Textbox
                      label="Title Image Author"
                      name="imageauthor"
                      value={content.imageAuthor}
                      onChange={useCallback(
                        (value: ChangeEvent<HTMLInputElement>) =>
                          handleChangeEvent("imageAuthor", value),
                        [handleChangeEvent]
                      )}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Textbox
                      label="Title Image Alt"
                      name="imagealt"
                      value={content.imageAlt}
                      onChange={useCallback(
                        (value: ChangeEvent<HTMLInputElement>) =>
                          handleChangeEvent("imageAlt", value),
                        [handleChangeEvent]
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <Textarea
                      label="Description"
                      name="description"
                      value={content.description}
                      placeholder="This is..."
                      description="Brief description for your article."
                      onChange={useCallback(
                        (value: ChangeEvent<HTMLTextAreaElement>) =>
                          handleChangeEvent("description", value),
                        [handleChangeEvent]
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
        <Preview
          content={preview}
          outdated={preview !== content}
          onUpdate={useRef(() => setPreview(contentRef.current)).current}
        />
      </div>
      <Outlet />
    </section>
  );
}

type PreviewProps = {
  content: Content;
  outdated: boolean;
  onUpdate: () => void;
};

const Preview: React.FC<PreviewProps> = ({
  outdated,
  onUpdate,
  content: {
    title,
    category,
    description,
    imageUrl,
    imageAlt,
    imageAuthor,
    body,
  },
}) => {
  return (
    <div className="absolute right-0 top-0 h-full w-screen translate-x-full transform md:static md:block md:w-full md:transform-none">
      <ArticleFull
        title={title}
        category={category}
        description={description}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        imageAuthor={imageAuthor}
      >
        {body}
      </ArticleFull>

      <button
        onClick={onUpdate}
        className={ocx(
          "absolute top-0 right-0 flex w-full origin-top items-center justify-center bg-black bg-opacity-30 transition-transform duration-150 md:w-1/2",
          outdated ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        )}
      >
        <RefreshIcon className="h-12 w-12" />
      </button>
    </div>
  );
};

type RadioImageProps = {
  url: string;
  checked: boolean;
};

const RadioImage: React.FC<RadioImageProps> = ({ url, checked }) => {
  return (
    <div
      className={ocx(
        "h-32 w-32 cursor-pointer overflow-hidden rounded-md ring-2 ring-offset-2",
        checked ? "ring-orange-500" : "ring-transparent"
      )}
    >
      <img src={url} className="h-full w-full object-cover" alt={url} />
    </div>
  );
};
