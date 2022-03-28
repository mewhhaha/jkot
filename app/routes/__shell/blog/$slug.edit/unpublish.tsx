import { EyeOffIcon } from "@heroicons/react/outline";
import { useRef, useCallback } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useNavigate,
  useSubmit,
} from "remix";
import { Modal } from "~/components/Modal";
import { articleKeys } from "~/services/article.server";
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

    if (settings.published === undefined || settings.status === "unpublished") {
      return redirect("/blog");
    }

    const published = new Date(settings.published);

    const { dateKey, slugKey } = articleKeys({
      date: published,
      slug: settings.slug,
    });

    await Promise.all([
      context.ARTICLE_KV.delete(dateKey),
      context.ARTICLE_KV.delete(slugKey),
      settingsDO.put({
        ...settings,
        status: "unpublished",
      }),
    ]);

    return redirect("/blog");
  });

export default function Unpublish() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Modal.Confirm
        title="Unpublish article"
        icon={
          <EyeOffIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        }
      >
        Are you sure you want to unpublish this article? This will make it
        unavailable publicly. It is possible to publish the article again after
        unpublishing but it will be published on the same date.
      </Modal.Confirm>
      <Form method="post">
        <Modal.CancelAccept ref={ref} onCancel={handleClose}>
          Unpublish
        </Modal.CancelAccept>
      </Form>
    </Modal>
  );
}
