import { useCallback, useRef, useState } from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { useNavigate } from "remix";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";
import type { KVImage } from "~/services/image.server";
import { item } from "~/services/settings.server";

type LoaderImage = { created: string; url: string };

type LoaderData = { images: LoaderImage[] };

export const loader: LoaderFunction = (args) =>
  requireAuthentication(
    args,
    async ({ context, params, request }): Promise<LoaderData> => {
      const slug = params.slug === "empty" ? "" : params.slug;
      if (slug === undefined) {
        throw new Error("Invariant");
      }

      const articleSettings = await item(
        request,
        context,
        `article/${slug}`
      ).json();

      if (articleSettings.id === undefined) {
        throw new Response("Not found", { status: 404 });
      }

      const list = await context.IMAGE_KV.list<KVImage>({
        prefix: `id#${articleSettings.id}`,
      });

      const images = await Promise.all(
        list.keys.map((id) => {
          return context.IMAGE_KV.get<KVImage>(id.name, "json");
        })
      );

      return {
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

export default function Images() {
  const { images } = useLoaderData<LoaderData>();
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [copied, setCopied] = useState<LoaderImage>();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  const handleCopy = useCallback((image: LoaderImage) => {
    return () => {
      navigator.clipboard.writeText(markdownImage(image));
      setCopied(image);
    };
  }, []);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <div className="grid h-full w-full gap-4 overflow-auto p-4">
        {images.map((image) => {
          return (
            <button
              key={image.url}
              onClick={handleCopy(image)}
              className="relative bg-black"
            >
              <img
                src={image.url}
                alt={image.url}
                className="hover:opacity-70"
              ></img>
              {copied === image && (
                <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 font-medium text-white">
                  Copied
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

const markdownImage = ({ url, created }: LoaderImage) => {
  return `![${created}](${url})`;
};
