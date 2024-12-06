// Modal.js
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded-lg">
        <button onClick={onClose} className="mb-4 text-red-500">
          Close
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
