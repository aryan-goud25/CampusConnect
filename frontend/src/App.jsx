
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot.jsx";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent.jsx";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyRegistrations from "./pages/MyRegistrations";
import OrganizerScanner from "./pages/OrganizerScanner.jsx";
import InterestSelection from "./pages/InterestSelection";
import MyBookmarks from "./pages/MyBookmarks";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/interests" element={<InterestSelection />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/my-bookmarks" element={<MyBookmarks />} />
        <Route
          path="/organizer-scanner"
          element={<OrganizerScanner />}
        />
        <Route
          path="/organizer-analytics"
          element={<Analytics />}
        />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
