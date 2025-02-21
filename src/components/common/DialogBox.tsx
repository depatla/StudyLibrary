import React from "react";

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "success" | "confirm";
}

const DialogBox: React.FC<DialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  type = "confirm",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {title}
        </h2>
        <p className="text-gray-600 mt-2 text-center">{message}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-black rounded-lg"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg ${
              type === "confirm"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
