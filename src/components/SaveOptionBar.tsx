import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

interface SaveOptionProps {
    onSave: () => void;
    onBack: () => void;
    initialTitle: string;
}

const SaveOptionBar: React.FC<SaveOptionProps> = ({ onSave, onBack, initialTitle, status }) => {
    const [title, setTitle] = useState<string>(initialTitle);
    const statusLabel = status === 'failed' ? 'Failed' : 'Passed';
    const statusColor =
        status === 'failed'
            ? 'text-red-600 bg-red-100 border border-red-300'
            : 'text-green-600 bg-green-100 border border-green-300';

    return (
        <div
            className="absolute top-2 left-2 flex items-center justify-between p-2 border border-gray-300 rounded-lg shadow-md bg-white w-[390px] z-50"
            style={{ pointerEvents: "auto" }} // Ensures clicks are registered
        >
            {/* Go Back Button */}
            <button onClick={onBack} className="flex items-center text-black-600 underline font-bold">                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Go Back</span>
            </button>

            {/* Editable Title */}
            <input
                readOnly
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none outline-none text-sm font-semibold text-gray-800 bg-white text-center w-[200px]"
            />
            {/* <span className="text-gray-800 font-medium">Workflow: {workflowId}</span> */}
            <span className={`px-2 py-1 text-sm rounded-md ${statusColor}`}>
                {statusLabel}
            </span>

            {/* Save Button */}
            {/* <button onClick={onSave} className="text-yellow-500 hover:text-yellow-600">
                <Save className="w-5 h-5" />
            </button> */}
        </div>
    );
};

export default SaveOptionBar;
