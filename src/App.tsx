import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";

function Dashboard() {
  return (
    <div className="ml-56 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Temporary Dashboard */}
        <Route
          path="/dashboard"
          element={
            <>
              <Sidebar />
              <Dashboard />
            </>
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;