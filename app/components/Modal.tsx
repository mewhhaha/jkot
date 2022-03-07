import { Transition, Dialog } from "@headlessui/react";
import { Fragment, forwardRef } from "react";

type ModalProps = {
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
            {children}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

type CancelDestroyProps = {
  onDestroy: () => void;
  onCancel: () => void;
  children: string;
};

const CancelDestroy = forwardRef<HTMLButtonElement, CancelDestroyProps>(
  ({ onDestroy, onCancel, children }, ref) => {
    return (
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
          onClick={onDestroy}
        >
          {children}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
          onClick={onCancel}
          ref={ref}
        >
          Cancel
        </button>
      </div>
    );
  }
);

CancelDestroy.displayName = "CancelDestroy";

type CancelAcceptProps = {
  onAccept: () => void;
  onCancel: () => void;
  children: string;
};

const CancelAccept = forwardRef<HTMLButtonElement, CancelAcceptProps>(
  ({ onAccept, onCancel, children }, ref) => {
    return (
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
          onClick={onAccept}
        >
          {children}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
          onClick={onCancel}
          ref={ref}
        >
          Cancel
        </button>
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
        <button
          ref={ref}
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  }
);

Cancel.displayName = "Cancel";

type ConfirmProps = {
  title: string;
  icon: React.ReactNode;
};

const Confirm: React.FC<ConfirmProps> = ({ title, children, icon }) => {
  return (
    <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
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
    </div>
  );
};

type WarningProps = {
  title: string;
  icon: React.ReactNode;
};

const Warning: React.FC<WarningProps> = ({ title, children, icon }) => {
  return (
    <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
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
    </div>
  );
};

Modal.Confirm = Confirm;
Modal.Warning = Warning;
Modal.Cancel = Cancel;
Modal.CancelAccept = CancelAccept;
Modal.CancelDestroy = CancelDestroy;
