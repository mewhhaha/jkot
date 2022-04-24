import { useCallback, useRef } from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { useNavigate } from "remix";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";
import type { KVImage } from "~/services/image.server";

type LoaderImage = { created: string; url: string };

type LoaderData = { images: LoaderImage[] };

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ context }): Promise<LoaderData> => {
    const list = await context.IMAGE_KV.list<KVImage>();

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
            url: `https://imagedelivery.net/${context.ACCOUNT_ID}/${id}/public`,
          };
        }),
    };
  });

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {});

export default function Delete() {
  const { images } = useLoaderData<LoaderData>();
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <div className="w-full h-full overflow-auto grid gap-4 p-4">
        {images.map((image) => {
          return <img key={image.url} src={image.url} alt={image.url}></img>;
        })}
      </div>
    </Modal>
  );
}
