import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { IWorkflow } from '../types/workflow';
import { Star, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

function WorkflowList() {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadWorkflows();
  }, [page, sortField, sortOrder]);

  const loadWorkflows = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const workflowsRef = collection(db, 'workflows');
      
      let baseQuery = query(
        workflowsRef,
        where('userId', '==', user.uid),
        orderBy(sortField, sortOrder as 'asc' | 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (page > 1 && workflows.length > 0) {
        const lastVisible = await getDocs(query(
          workflowsRef,
          where('userId', '==', user.uid),
          orderBy(sortField, sortOrder as 'asc' | 'desc'),
          limit((page - 1) * ITEMS_PER_PAGE)
        ));
        
        const lastDoc = lastVisible.docs[lastVisible.docs.length - 1];
        baseQuery = query(
          workflowsRef,
          where('userId', '==', user.uid),
          orderBy(sortField, sortOrder as 'asc' | 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(baseQuery);
      const workflowData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IWorkflow[];
      
      setWorkflows(prev => page === 1 ? workflowData : [...prev, ...workflowData]);
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

  const filteredWorkflows = workflows.filter(workflow => {
    const searchLower = searchTerm.toLowerCase();
    return workflow.name.toLowerCase().includes(searchLower) ||
           workflow.id.toLowerCase().includes(searchLower);
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#FAF8F5]">
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

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead className="border-b-2 border-gray-200">
              <tr className="text-left text-gray-600 text-sm">
                <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => { setSortField('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>Workflow Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => { setSortField('updatedAt'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>Last Edited On {sortField === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="bg-white hover:bg-gray-50 rounded-lg">
                  <td className="px-6 py-4 font-medium text-gray-900">{workflow.name}</td>
                  <td className="px-6 py-4 text-gray-500">#{workflow.id}</td>
                  <td className="px-6 py-4 text-gray-500">{workflow.updatedAt ? `${user?.email} | ${new Date(workflow.updatedAt.seconds * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST - ${new Date(workflow.updatedAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/')}` : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500">{workflow.description}</td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <Star className="text-yellow-500 cursor-pointer" size={18} />
                    <button className="px-3 py-1 bg-black text-white text-sm rounded-md shadow-md">Execute</button>
                    <button className="px-3 py-1 bg-gray-200 text-black text-sm rounded-md">Edit</button>
                    <MoreVertical className="text-gray-600 cursor-pointer" size={18} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 flex items-center gap-2 text-gray-600 disabled:text-gray-400"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
          className="px-4 py-2 flex items-center gap-2 text-gray-600 disabled:text-gray-400"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default WorkflowList;