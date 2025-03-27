import React from 'react';

interface NodeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

const NodeSelectionModal: React.FC<NodeSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <h3>Add New Node</h3>
      <button onClick={() => onSelect('email')} style={{ margin: '5px', padding: '8px', cursor: 'pointer' }}>Email</button>
      <button onClick={() => onSelect('api')} style={{ margin: '5px', padding: '8px', cursor: 'pointer' }}>API</button>
      <button onClick={() => onSelect('text')} style={{ margin: '5px', padding: '8px', cursor: 'pointer' }}>Text</button>
      <button onClick={onClose} style={{ marginTop: '10px', padding: '8px', cursor: 'pointer' }}>Cancel</button>
    </div>
  );
};

export default NodeSelectionModal;