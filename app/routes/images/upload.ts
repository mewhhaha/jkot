import { ActionFunction } from "remix";
import { requireAuthentication } from "~/services/auth.server";
import { imageKeys, KVImage } from "~/services/image.server";

type SignedURLResponse = {
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
  requireAuthentication(args, async ({ request, context }, user) => {
    const formData = new FormData();
    formData.append(
      "metadata",
      JSON.stringify({ user: user.id, created: new Date().toISOString() })
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

    const now = new Date();
    const { dateKey } = imageKeys({ date: now });

    const kvImage: KVImage = { id, uploaded: now.toISOString() };
    await context.IMAGE_KV.put(dateKey, JSON.stringify(kvImage));

    return uploadURL;
  });
