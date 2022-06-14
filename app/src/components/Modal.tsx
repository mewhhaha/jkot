import { Transition, Dialog } from "@headlessui/react";
import { Fragment, forwardRef } from "react";
import { Button } from "./Button";

type ModalProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  initialFocus: React.RefObject<HTMLElement>;
};

export type ModalFC = React.FC<ModalProps> & {
  Confirm: typeof Confirm;
  Warning: typeof Warning;
  CancelAccept: typeof CancelAccept;
  CancelDestroy: typeof CancelDestroy;
  Cancel: typeof Cancel;
};

export const Modal: ModalFC = ({ open, initialFocus, children, onClose }) => {
  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={initialFocus}
        onClose={onClose}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

type CancelDestroyProps = {
  onCancel: () => void;
  children: string;
};

const CancelDestroy = forwardRef<HTMLButtonElement, CancelDestroyProps>(
  ({ onCancel, children }, ref) => {
    return (
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <Button
          type="submit"
          danger
          className="text-base sm:col-start-2 sm:text-sm"
        >
          {children}
        </Button>
        <Button
          type="button"
          className="mt-3 text-base sm:col-start-1 sm:mt-0 sm:text-sm"
          onClick={onCancel}
          ref={ref}
        >
          Cancel
        </Button>
      </div>
    );
  }
);

CancelDestroy.displayName = "CancelDestroy";

type CancelAcceptProps = {
  onCancel: () => void;
  children: string;
};

const CancelAccept = forwardRef<HTMLButtonElement, CancelAcceptProps>(
  ({ onCancel, children }, ref) => {
    return (
      <div className="mt-5 sm:mt-6 grid grid-flow-row-dense grid-cols-2 gap-3">
        <Button
          type="submit"
          primary
          className="text-base sm:col-start-2 sm:text-sm"
        >
          {children}
        </Button>
        <Button
          type="button"
          className="mt-3 text-base sm:col-start-1 sm:mt-0 sm:text-sm"
          onClick={onCancel}
          ref={ref}
        >
          Cancel
        </Button>
      </div>
    );
  }
);

CancelAccept.displayName = "CancelAccept";

type CancelProps = {
  onCancel: () => void;
};

const Cancel = forwardRef<HTMLButtonElement, CancelProps>(
  ({ onCancel }, ref) => {
    return (
      <div className="mt-5 sm:mt-6">
        <Button
          ref={ref}
          type="button"
          className="mt-3 text-base sm:col-start-1 sm:mt-0 sm:text-sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }
);

Cancel.displayName = "Cancel";

type ConfirmProps = {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
};

const Confirm: React.FC<ConfirmProps> = ({ title, children, icon }) => {
  return (
    <div>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        {icon}
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-gray-900"
        >
          {title}
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{children}</p>
        </div>
      </div>
    </div>
  );
};

type WarningProps = {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
};

const Warning: React.FC<WarningProps> = ({ title, children, icon }) => {
  return (
    <div>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        {icon}
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-gray-900"
        >
          {title}
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{children}</p>
        </div>
      </div>
    </div>
  );
};

Modal.Confirm = Confirm;
Modal.Warning = Warning;
Modal.Cancel = Cancel;
Modal.CancelAccept = CancelAccept;
Modal.CancelDestroy = CancelDestroy;
