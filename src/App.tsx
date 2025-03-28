import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { auth } from './config/firebase';
import ExecutionFlowPage from './pages/ExecutionFlowPage';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkflowCreate from './pages/WorkflowCreate';
import WorkflowList from './pages/WorkflowList';
import WorkflowView from './pages/WorkflowView';
import { useAuthStore } from './store/authStore';
import WorkflowEdit from './pages/WorkflowEdit';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/workflows"
            element={
              <PrivateRoute>
                <WorkflowList />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflows/create"
            element={
              <PrivateRoute>
                <WorkflowCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/workflows/:id"
            element={
              <PrivateRoute>
                <WorkflowView />
              </PrivateRoute>
            }
          />

          {/* New route: Pass both workflowId and execution index */}
          <Route
            path="/workflows/executionflow/:workflowId/:executionIndex"
            element={
              <PrivateRoute>
                <ExecutionFlowPage />
              </PrivateRoute>
            }
          />

          {/* Fallback route (if no executionIndex is provided, you can also add a route without it) */}
          <Route
            path="/workflows/executionflow/:workflowId"
            element={
              <PrivateRoute>
                <ExecutionFlowPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/workflows/edit/:id"
            element={
              <PrivateRoute>
                <WorkflowEdit />
              </PrivateRoute>
            }
          />


          <Route path="/" element={<Navigate to="/workflows" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
