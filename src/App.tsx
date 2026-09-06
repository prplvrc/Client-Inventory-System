import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { BranchProvider } from "./context/branchContext";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Products from "./components/Products";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Recommendation from "./components/Recommendation";
import Forecasting from "./components/Forecasting";
import Dashboard from "./components/Dashboard";
import PoS from "./components/PoS";
import AuditLogs from "./components/AuditLogs";
import Account from "./components/Account";
import Categories from "./components/Categories";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./routes/protectedRoutes";
import AdminRoute from "./routes/adminRoute";

function App() {
  return (
    <AuthProvider>
      <BranchProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/pos" element={<PoS />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/account" element={<Account />} />

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/recommendation" element={<Recommendation />} />
                  <Route path="/forecasting" element={<Forecasting />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </BranchProvider>
    </AuthProvider>
  );
}

export default App;