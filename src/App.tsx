import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Register from "./pages/Register";
import StudyMaterials from "./pages/StudyMaterials";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/study-materials" element={<StudyMaterials />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}