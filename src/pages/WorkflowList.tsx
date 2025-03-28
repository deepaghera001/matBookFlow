import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { IWorkflow } from '../types/workflow';
import {
  Star,
  Pin,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WorkflowExecutionService } from '../services/workflowExecutionService';
import ExecutionHistoryTimeline from '../components/ExecutionHistoryTimeline';

function WorkflowList() {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);

  // Which workflow’s history is expanded
  const [selectedHistoryWorkflow, setSelectedHistoryWorkflow] = useState<string | null>(null);

  // For total count (so we can do numeric pagination)
  const [totalWorkflows, setTotalWorkflows] = useState(0);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ITEMS_PER_PAGE = 10;

  // Calculate total pages
  const totalPages = Math.ceil(totalWorkflows / ITEMS_PER_PAGE);

  const executeWorkflow = async (workflowId: string) => {
    setExecutingWorkflow(workflowId);
    setExecutionError(null);
    setExecutionResults(null);

    try {
      const workflowDoc = await getDoc(doc(db, 'workflows', workflowId));
      if (!workflowDoc.exists()) {
        throw new Error('Workflow not found');
      }
      const workflowData = workflowDoc.data();
      const executionService = new WorkflowExecutionService();
      const results = await executionService.executeWorkflow(
        workflowId,
        workflowData.nodes,
        workflowData.edges
      );
      setExecutionResults(results);
    } catch (error) {
      console.error('Error executing workflow:', error);
      setExecutionError(error instanceof Error ? error.message : 'Error executing workflow');
    } finally {
      setExecutingWorkflow(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch total number of workflows for the user
    const fetchTotalWorkflows = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'workflows'), where('userId', '==', user.uid))
        );
        setTotalWorkflows(snapshot.size);
      } catch (error) {
        console.error('Error fetching total workflows:', error);
      }
    };

    fetchTotalWorkflows();
  }, [user]);

  useEffect(() => {
    loadWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField, sortOrder]);

  const loadWorkflows = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const workflowsRef = collection(db, 'workflows');

      let baseQuery = query(
        workflowsRef,
        where('userId', '==', user.uid),
        orderBy(sortField, sortOrder),
        limit(ITEMS_PER_PAGE)
      );

      if (page > 1 && workflows.length > 0) {
        // we need to skip (page-1)*ITEMS_PER_PAGE docs
        const skipSnapshot = await getDocs(
          query(
            workflowsRef,
            where('userId', '==', user.uid),
            orderBy(sortField, sortOrder),
            limit((page - 1) * ITEMS_PER_PAGE)
          )
        );

        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        baseQuery = query(
          workflowsRef,
          where('userId', '==', user.uid),
          orderBy(sortField, sortOrder),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(baseQuery);
      const workflowData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IWorkflow[];

      // If it's a new page, we replace if page=1, else we append
      setWorkflows((prev) => (page === 1 ? workflowData : [...prev, ...workflowData]));

      // If we got fewer than ITEMS_PER_PAGE, no more data
      setHasMore(workflowData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading workflows:', error);
      if (error instanceof Error && error.message.includes('index')) {
        console.error('Please create a composite index for this query in Firebase Console');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(searchLower) ||
      workflow.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#FAF8F5]">
      {/* Top bar: Search + Create button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search By Workflow Name/ID"
          className="w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          onClick={() => navigate('/workflows/create')}
          className="px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800"
        >
          + Create New Process
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead className="border-b-2 border-gray-200">
              <tr className="text-left text-gray-600 text-sm">
                <th
                  className="px-6 py-4 font-semibold cursor-pointer"
                  onClick={() => {
                    setSortField('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Workflow Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer"
                  onClick={() => {
                    setSortField('updatedAt');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Last Edited On {sortField === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => {
                const isSelected = selectedHistoryWorkflow === workflow.id;
                return (
                  <React.Fragment key={workflow.id}>
                    <tr
                      className={`${
                        isSelected ? 'bg-[#fefcfb]' : 'bg-white'
                      } hover:bg-gray-50 rounded-lg`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{workflow.name}</td>
                      <td className="px-6 py-4 text-gray-500">#{workflow.id}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {workflow.updatedAt
                          ? `${user?.email} | ${new Date(
                              workflow.updatedAt.seconds * 1000
                            ).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })} IST - ${new Date(
                              workflow.updatedAt.seconds * 1000
                            )
                              .toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              .split('/')
                              .join('/')}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{workflow.description}</td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        {/* <Star className="text-yellow-500 cursor-pointer" size={18} /> */}
                        <Pin className="text-gray-500 cursor-pointer" size={18} />
                        <button
                          onClick={() => executeWorkflow(workflow.id)}
                          className="px-3 py-2 bg-white text-black text-sm border border-gray-300 rounded-md"
                        >
                          Execute
                        </button>

                        {/* Redirect to WorkflowEdit on click */}
                        <button
                          onClick={() => navigate(`/workflows/edit/${workflow.id}`)}
                          className="px-3 py-2 bg-white text-black text-sm border border-gray-300 rounded-md"
                        >
                          Edit
                        </button>

                        {/* Toggle history: Show down arrow if collapsed, up arrow if expanded */}
                        <button
                          onClick={() =>
                            setSelectedHistoryWorkflow(isSelected ? null : workflow.id)
                          }
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                          <MoreVertical size={18} />
                          {isSelected ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    </tr>
                    {isSelected && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4">
                          <ExecutionHistoryTimeline workflowId={workflow.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Numeric Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-600 disabled:text-gray-400"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`px-3 py-2 rounded-md border ${
                pageNumber === page
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
            disabled={!hasMore}
            className="p-2 text-gray-600 disabled:text-gray-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Optional: Execution Modal for real-time results */}
      {(executingWorkflow || executionResults || executionError) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {executingWorkflow
                  ? 'Executing Workflow...'
                  : executionError
                  ? 'Execution Error'
                  : 'Execution Results'}
              </h3>
              <button
                onClick={() => {
                  setExecutingWorkflow(null);
                  setExecutionResults(null);
                  setExecutionError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {executingWorkflow && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            )}
            {executionError && <div className="text-red-600 py-4">{executionError}</div>}
            {executionResults && (
              <div className="space-y-4">
                {Array.from(executionResults.entries()).map(([nodeId, result]: [string, any]) => (
                  <div
                    key={nodeId}
                    className={`p-4 rounded-lg ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Node ID: {nodeId}</h4>
                        <p
                          className={`text-sm ${
                            result.success ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {result.success ? 'Success' : 'Failed'}
                        </p>
                      </div>
                    </div>
                    {result.success ? (
                      <pre className="mt-2 bg-gray-50 p-2 rounded text-sm overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    ) : (
                      <p className="mt-2 text-red-600">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowList;
