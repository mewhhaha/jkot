import type { ActionFunction } from "remix";
import { requireAuthentication } from "~/services/auth.server";
import type { KVImage } from "~/services/image.server";
import { createImageKey } from "~/services/image.server";

export type SignedURLResponse = {
  result: {
    id: string;
    uploadURL: string;
  };
  result_info: null;
  success: boolean;
  errors: unknown[];
  messages: unknown[];
};

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ context, params }, user) => {
    const group = params.group;

    if (group === undefined) {
      throw new Error("Invariant");
    }

    const now = new Date();

    const formData = new FormData();
    formData.append(
      "metadata",
      JSON.stringify({ user: user.id, created: now.toISOString() })
    );

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${context.ACCOUNT_ID}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${context.IMAGES_ACCESS_TOKEN}`,
        }),
        body: formData,
      }
    );

    if (response.status !== 200) {
      throw response;
    }

    const {
      result: { uploadURL, id },
    } = await response.json<SignedURLResponse>();

    const imageKey = createImageKey({ date: now, group });

    const kvImage: KVImage = { id, created: now.toISOString() };
    await context.IMAGE_KV.put(imageKey, JSON.stringify(kvImage));

    return uploadURL;
  });

export type CreateImageResponse = {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  result_info: unknown;
  success: boolean;
  errors: unknown[];
  messages: unknown[];
};

export const uploadImage = async (formData: FormData, group: string) => {
  const signedResponse = await fetch(`/images/${group}/upload`, {
    method: "POST",
  });

  const url = await signedResponse.json<string>();

  const uploadResponse = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const {
    result: {
      variants: [first],
    },
  } = await uploadResponse.json<CreateImageResponse>();
  return first;
};
