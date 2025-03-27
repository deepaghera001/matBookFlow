import { addDoc, collection } from "firebase/firestore";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore"; // Adjust the path if needed

interface SaveOptionProps {
  nodes: any[];
  edges: any[];
  onBack: () => void;
}

// Recursive function to remove functions from any object or array
const removeFunctions = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(removeFunctions);
  } else if (value !== null && typeof value === "object") {
    const newObj: any = {};
    Object.entries(value).forEach(([key, val]) => {
      if (typeof val !== "function") {
        newObj[key] = removeFunctions(val);
      }
    });
    return newObj;
  }
  return value;
};

const SaveOption: React.FC<SaveOptionProps> = ({ nodes, edges, onBack }) => {
  const [workflowName, setWorkflowName] = useState<string>("Untitled");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sanitize nodes and edges deeply to remove any function values
      const sanitizedNodes = removeFunctions(nodes);
      const sanitizedEdges = removeFunctions(edges);

      const workflowData = {
        name: workflowName,
        createdBy: user?.displayName || user?.email || "Unknown",
        nodes: sanitizedNodes,
        edges: sanitizedEdges,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "workflows"), workflowData);
      alert("Workflow saved successfully!");
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Error saving workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* Editable Workflow Name */}
      <input
        type="text"
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="border-none outline-none text-sm font-semibold text-gray-800 bg-white text-center w-[80px]"
      />

      {/* Save Button */}
      <button onClick={handleSave} className="text-yellow-500 hover:text-yellow-600" disabled={isSaving}>
        <Save className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SaveOption;
