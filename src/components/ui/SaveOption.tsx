import { addDoc, collection } from "firebase/firestore";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore";
import SaveWorkflowModal from "../modals/SaveWorkflowModal";

interface SaveOptionProps {
  nodes: any[];
  edges: any[];
  onBack: () => void | undefined;
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const handleSave = async (name: string, description: string) => {
    setIsSaving(true);
    try {
      // Sanitize nodes and edges deeply to remove any function values
      const sanitizedNodes = removeFunctions(nodes);
      const sanitizedEdges = removeFunctions(edges);

      const workflowData = {
        name,
        description,
        createdBy: user?.displayName || user?.email || "Unknown",
        userId: user?.uid,
        nodes: sanitizedNodes,
        edges: sanitizedEdges,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, "workflows"), workflowData);
      alert("Workflow saved successfully!");
      navigate('/workflows');
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Error saving workflow. Please try again.");
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
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
      <button onClick={() => setIsModalOpen(true)} className="text-yellow-500 hover:text-yellow-600" disabled={isSaving}>
        <Save className="w-5 h-5" />
      </button>
    </div>

    <SaveWorkflowModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSave={handleSave}
      initialName={workflowName}
    />
    </>
  );
};

export default SaveOption;
