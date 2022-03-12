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
import { article } from "~/services/article.server";
import { requireAuthentication } from "~/services/auth.server";
import { item } from "~/services/settings.server";
import { invertTime } from "~/utils/date";

export const loader: LoaderFunction = (args) => requireAuthentication(args);

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    const slug = params.slug;

    const settingsDO = item(request, context, `article/${slug}`);
    const settings = await settingsDO.json();

    if (settings.id === undefined) {
      throw new Error("Article has no reference");
    }

    const content = await article(request, context, settings.id).read();

    const published = settings.published
      ? new Date(settings.published)
      : new Date();

    // Invert time to order KV in descending order
    const key = `${invertTime(published.getTime())}-${settings.id}}`;

    await Promise.all([
      context.ARTICLE_KV.put(key, JSON.stringify(content)),
      settingsDO.put({
        ...settings,
        status: "published",
        published: published.toISOString(),
      }),
    ]);

    return redirect("../");
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
