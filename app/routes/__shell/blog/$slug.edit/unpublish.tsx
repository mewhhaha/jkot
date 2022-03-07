import { EyeOffIcon } from "@heroicons/react/outline";
import { useRef, useCallback } from "react";
import { useNavigate } from "remix";
import { Modal } from "~/components/Modal";

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
        title="Unpublish article"
        icon={
          <EyeOffIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        }
      >
        Are you sure you want to unpublish this article? This will make it
        unavailable publicly. This action can be undone by publishing the
        article again.
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
