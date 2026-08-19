import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/login";

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Login />
    </BrowserRouter>
  );
}

export default App;