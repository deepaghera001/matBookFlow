import React from 'react';

const NodeConfigurationModal = ({
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 border border-gray-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Configure {nodeConfig.type?.toUpperCase()} Node
        </h3>
        {nodeConfig.type === 'email' && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={nodeConfig.data?.email || ''}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Type here..."
            />
          </div>
        )}
        {nodeConfig.type === 'api' && (
          <div>
            <label className="block text-sm font-medium text-gray-600">Method</label>
            <select
              name="method"
              value={nodeConfig.data?.method || 'GET'}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <label className="block text-sm font-medium text-gray-600 mt-4">URL</label>
            <input
              type="text"
              name="url"
              value={nodeConfig.data?.url || ''}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Type here..."
            />
            <label className="block text-sm font-medium text-gray-600 mt-4">Headers</label>
            <input
              type="text"
              name="headers"
              value={nodeConfig.data?.headers || ''}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Header Name"
            />
            <label className="block text-sm font-medium text-gray-600 mt-4">Body</label>
            <textarea
              name="body"
              value={nodeConfig.data?.body || ''}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Enter Descriptions..."
            />
          </div>
        )}
        {nodeConfig.type === 'text' && (
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-600">
              Message
            </label>
            <textarea
              id="text"
              name="text"
              value={nodeConfig.data?.text || ''}
              onChange={onConfigChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Enter..."
            />
          </div>
        )}
        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigurationModal;