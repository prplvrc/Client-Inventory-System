import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated App Routes */}
        <Route element={<Layout />}>
          <Route path="/pos" element={<PoS />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/forecasting" element={<Forecasting />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;