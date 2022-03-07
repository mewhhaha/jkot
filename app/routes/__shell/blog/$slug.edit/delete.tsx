import { ExclamationIcon } from "@heroicons/react/outline";
import { useCallback, useRef } from "react";
import { useNavigate } from "remix";
import { Modal } from "~/components/Modal";

export default function Delete() {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("../");
  }, [navigate]);

  const handleDestroy = useCallback(() => {
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
