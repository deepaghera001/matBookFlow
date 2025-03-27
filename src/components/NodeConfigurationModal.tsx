import React from 'react';

interface NodeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  nodeConfig: any; // Define a more specific type if possible
  onConfigChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const NodeConfigurationModal: React.FC<NodeConfigurationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeConfig,
  onConfigChange,
}) => {
  if (!isOpen || !nodeConfig) {
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
      <h3>Configure {nodeConfig.type?.toUpperCase()} Node</h3>
      {nodeConfig.type === 'email' && (
        <div>
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={nodeConfig.data?.email || ''}
            onChange={onConfigChange}
            style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }}
          />
        </div>
      )}
      {nodeConfig.type === 'api' && (
        <div>
          <label htmlFor="url">API URL:</label>
          <input
            type="text"
            id="url"
            name="url"
            value={nodeConfig.data?.url || ''}
            onChange={onConfigChange}
            style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }}
          />
          <label htmlFor="method">Request Type:</label>
          <select
            id="method"
            name="method"
            value={nodeConfig.data?.method || 'GET'}
            onChange={onConfigChange}
            style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      )}
      {nodeConfig.type === 'text' && (
        <div>
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            name="text"
            value={nodeConfig.data?.text || ''}
            onChange={onConfigChange}
            style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }}
          />
        </div>
      )}
      <button onClick={onSave} style={{ margin: '5px', padding: '8px', cursor: 'pointer' }}>Save</button>
      <button onClick={onClose} style={{ margin: '5px', padding: '8px', cursor: 'pointer' }}>Cancel</button>
    </div>
  );
};

export default NodeConfigurationModal;