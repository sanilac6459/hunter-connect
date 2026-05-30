import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GroupDetails from "./pages/GroupDetails";
import Settings from "./pages/Settings";
import RSVPs from "./pages/RSVPs";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/clubs" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/rsvps" element={<RSVPs />} />
      </Routes>
    </>
  );
}

export default App;
