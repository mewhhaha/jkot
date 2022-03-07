import { EyeIcon } from "@heroicons/react/outline";
import { useRef, useCallback } from "react";
import { LoaderFunction, useNavigate } from "remix";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";

export const loader: LoaderFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {
    return null;
  });

export default function Publish() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  const handleAccept = useCallback(() => {
    navigate("../");
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
