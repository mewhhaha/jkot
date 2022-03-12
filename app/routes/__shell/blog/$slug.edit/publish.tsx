import { EyeIcon } from "@heroicons/react/outline";
import { useRef, useCallback } from "react";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useNavigate,
  useSubmit,
} from "remix";
import { Modal } from "~/components/Modal";
import { article, articleKeys } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import { PublishedContent } from "~/types";

export const loader: LoaderFunction = (args) => requireAuthentication(args);

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }, user) => {
    const settingsDO = item(request, context, `article/${params.slug}`);
    const settings = await settingsDO.json();

    if (settings.id === undefined || settings.slug === undefined) {
      throw new Error("Article has no reference");
    }

    const content = await article(request, context, settings.id).read();

    const published = settings.published
      ? new Date(settings.published)
      : new Date();

    const { dateKey, slugKey } = articleKeys({
      date: published,
      slug: settings.slug,
    });

    const publishedContent: PublishedContent = {
      ...content,
      published: published.toISOString(),
      slug: settings.slug,
      author: user.displayName,
      authorWebsite: user._json.website ?? "",
      authorImage: user._json.picture ?? "",
    };

    await Promise.all([
      context.ARTICLE_KV.put(dateKey, JSON.stringify(publishedContent)),
      context.ARTICLE_KV.put(slugKey, JSON.stringify(publishedContent)),
      settingsDO.put({
        ...settings,
        status: "published",
        published: published.toISOString(),
      }),
    ]);

    return redirect("/blog");
  });

export default function Publish() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const submit = useSubmit();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  const handleAccept = useCallback(() => {
    submit(null, { method: "post" });
  }, [submit]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Modal.Confirm
        title="Publish article"
        icon={<EyeIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
      >
        Are you sure you want to publish this article? This will make it
        available publicly. This action can be undone by unpublishing the
        article.
      </Modal.Confirm>
      <Modal.CancelAccept
        ref={ref}
        onCancel={handleClose}
        onAccept={handleAccept}
      >
        Publish
      </Modal.CancelAccept>
    </Modal>
  );
}
