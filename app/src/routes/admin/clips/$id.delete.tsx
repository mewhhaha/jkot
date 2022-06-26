import { ExclamationIcon } from "@heroicons/react/outline";
import { useCallback, useRef } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { Form, useNavigate } from "@remix-run/react";
import { Modal } from "~/components/Modal";
import { requireAuthentication } from "~/services/auth.server";

export const loader: LoaderFunction = (args) => requireAuthentication(args);

export const action: ActionFunction = (args) =>
  requireAuthentication(args, async ({ request, context, params }) => {});

export default function Delete() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("/admin/clips", { replace: true });
  }, [navigate]);

  return (
    <Modal initialFocus={ref} open onClose={handleClose}>
      <Modal.Warning
        title="Delete video"
        icon={
          <ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        }
      >
        Are you sure you want to delete this video? All of your data will be
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
