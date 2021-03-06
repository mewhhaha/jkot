import { EyeIcon } from "@heroicons/react/outline";
import { useRef, useCallback } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Form, useNavigate } from "@remix-run/react";
import { Modal } from "~/components/Modal";
import { article, articleKeys } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import type { PublishedContent } from "~/types";

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
      author: user._json.name,
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

    return redirect(`/admin/blog/${params.slug}/edit`);
  });

export default function Publish() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../", { replace: true });
  }, [navigate]);

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
      <Form method="post">
        <Modal.CancelAccept ref={ref} onCancel={handleClose}>
          Publish
        </Modal.CancelAccept>
      </Form>
    </Modal>
  );
}
