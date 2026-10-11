
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Gallery from "./pages/Gallery";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AddArtwork from "./pages/AddArtwork";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/add-artwork" element={<AddArtwork />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
