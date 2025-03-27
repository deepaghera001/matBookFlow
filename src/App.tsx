import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkflowCreate from './pages/WorkflowCreate';
import WorkflowList from './pages/WorkflowList';
import WorkflowView from './pages/WorkflowView';
import WorkflowResult from './pages/WorkflowResult';

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
          <Route
            path="/workflows/:id/result/:executionId"
            element={
              <PrivateRoute>
                <WorkflowResult />
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