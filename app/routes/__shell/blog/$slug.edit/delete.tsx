import { ExclamationIcon } from "@heroicons/react/outline";
import { useCallback, useRef } from "react";
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

    const articleDO = article(request, context, settings.id);

    if (settings.published === undefined || settings.status === "unpublished") {
      return redirect("../");
    }

    const published = new Date(settings.published);

    // Invert time to get the correct key
    const time = invertTime(published.getTime());

    await Promise.all([
      articleDO.destroy(),
      context.ARTICLE_KV.delete(time.toString()),
      settingsDO.put({
        ...settings,
        status: "unpublished",
      }),
    ]);

    return redirect("../");
  });

export default function Delete() {
  const ref = useRef<HTMLButtonElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  const handleDestroy = useCallback(() => {
    submit(null, { method: "post" });
  }, [submit]);
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
      <Modal.CancelDestroy
        ref={ref}
        onCancel={handleClose}
        onDestroy={handleDestroy}
      >
        Delete
      </Modal.CancelDestroy>
    </Modal>
  );
}
