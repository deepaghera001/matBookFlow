import { useState, useEffect } from "react";

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  initialDescription?: string;
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  initialDescription = ""
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[450px]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Save your workflow</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✖
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Name here"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            placeholder="Write here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => onSave(name, description)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveWorkflowModal;
