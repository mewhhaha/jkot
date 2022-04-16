import { ExclamationIcon } from "@heroicons/react/outline";
import { useCallback, useRef } from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { Form, redirect, useNavigate } from "remix";
import { Modal } from "~/components/Modal";
import { article, articleKeys } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";

export const loader: LoaderFunction = (args) => requireAuthentication(args);

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    const slug = params.slug;

    const settingsDO = item(request, context, `article/${slug}`);
    const settings = await settingsDO.json();

    if (settings.id === undefined || settings.slug === undefined) {
      throw new Error("Article has no reference");
    }

    const articleDO = article(request, context, settings.id);

    await Promise.all([
      articleDO.destroy(),
      settings.published
        ? context.ARTICLE_KV.delete(
            articleKeys({
              date: new Date(settings.published),
            }).dateKey
          )
        : Promise.resolve(),
      context.ARTICLE_KV.delete(
        articleKeys({
          slug: settings.slug,
        }).slugKey
      ),
      settingsDO.delete(),
    ]);

    return redirect("/blog");
  });

export default function Delete() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Modal.Warning
        title="Delete article"
        icon={
          <ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        }
      >
        Are you sure you want to delete this article? All of your data will be
        permanently removed forever. This action cannot be undone.
      </Modal.Warning>
      <Form method="post">
        <Modal.CancelDestroy ref={ref} onCancel={handleClose}>
          Delete
        </Modal.CancelDestroy>
      </Form>
    </Modal>
  );
}
