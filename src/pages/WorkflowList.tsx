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
  Pin,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
  Menu, // Hamburger icon
} from 'lucide-react';
import { WorkflowExecutionService } from '../services/workflowExecutionService';
import ExecutionHistoryTimeline from '../components/ExecutionHistoryTimeline';

function WorkflowList() {
  // --- Sidebar open/close state ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Auth / Navigation ---
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // --- Existing State ---
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

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalWorkflows / ITEMS_PER_PAGE);

  // --- Execution Logic ---
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

  // --- Fetch total workflows ---
  useEffect(() => {
    if (!user) return;
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

  // --- Load workflows ---
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
        // skip (page-1)*ITEMS_PER_PAGE docs
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

      // If it's a new page, replace if page=1, else append
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

  // --- Filter by search term ---
  const filteredWorkflows = workflows.filter((workflow) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(searchLower) ||
      workflow.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="relative min-h-screen bg-[#FAF8F5]">
      {/* Sidebar (Collapsible) */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        `}
        style={{ zIndex: 50 }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {/* Replace with your own logo/image */}
            <img
              src="https://via.placeholder.com/32"
              alt="Logo"
              className="w-8 h-8 object-cover"
            />
            <span className="font-bold text-lg">Menu</span>
          </div>
          {/* Close Button (X icon) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => {
              navigate('/workflows');
              setIsSidebarOpen(false);
            }}
            className="block w-full text-left text-gray-700 hover:text-gray-900"
          >
            Workflows
          </button>
          <button
            onClick={() => {
              navigate('/workflows/create');
              setIsSidebarOpen(false);
            }}
            className="block w-full text-left text-gray-700 hover:text-gray-900"
          >
            Create Workflow
          </button>
        </nav>

        {/* Profile + Logout at bottom */}
        {user && (
          <div className="p-4 border-t">
            <div className="flex items-center mb-3">
              <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="text-gray-700">
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="px-6 py-6">
        {/* Floating Hamburger Button to open sidebar (top-left corner) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-700 hover:text-gray-900 bg-white rounded shadow-md mb-4"
        >
          <Menu size={20} />
        </button>

       <span className='py-2 px-4 text-xl font-bold'>Workflow Builder</span> 

     

        {/* Search + Create New Process */}
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

        {/* Table of Workflows */}
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
                        className={`${isSelected ? 'bg-[#fefcfb]' : 'bg-white'
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
                          <Pin className="text-gray-500 cursor-pointer" size={18} />
                          <button
                            onClick={() => executeWorkflow(workflow.id)}
                            className="px-3 py-2 bg-white text-black text-sm border border-gray-300 rounded-md"
                          >
                            Execute
                          </button>

                          <button
                            onClick={() => navigate(`/workflows/edit/${workflow.id}`)}
                            className="px-3 py-2 bg-white text-black text-sm border border-gray-300 rounded-md"
                          >
                            Edit
                          </button>

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
                className={`px-3 py-2 rounded-md border ${pageNumber === page
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

        {/* Execution Modal for real-time results */}
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
                      className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Node ID: {nodeId}</h4>
                          <p
                            className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'
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
      </main>
    </div>
  );
}

export default WorkflowList;
