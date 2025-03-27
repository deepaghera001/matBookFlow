import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

interface SaveOptionProps {
  onSave: () => void;
  onBack: () => void;
}

const SaveOption: React.FC<SaveOptionProps> = ({ onSave, onBack }) => {
  const [title, setTitle] = useState<string>("Untitled");

  return (
    <div 
      className="absolute top-2 left-2 flex items-center justify-between p-2 border border-gray-300 rounded-lg shadow-md bg-white w-[250px] z-50"
      style={{ pointerEvents: "auto" }} // Ensures clicks are registered
    >
      {/* Go Back Button */}
      <button onClick={onBack} className="flex items-center text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span className="text-sm">Go Back</span>
      </button>

      {/* Editable Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border-none outline-none text-sm font-semibold text-gray-800 bg-white text-center w-[80px]"
      />

      {/* Save Button */}
      <button onClick={onSave} className="text-yellow-500 hover:text-yellow-600">
        <Save className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SaveOption;
