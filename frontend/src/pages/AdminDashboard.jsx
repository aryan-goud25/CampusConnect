
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/events";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const approveEvent = async (id) => {
    try {
      await axios.patch(`${API}/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not approve event.");
    }
  };

  const rejectEvent = async (id) => {
    const reason = window.prompt("Enter the reason for rejection:");
    if (!reason || !reason.trim()) return;

    try {
      await axios.patch(`${API}/${id}/reject`, { reason: reason.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not reject event.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Review and manage submitted college events.
            </p>
          </div>
          <button
            onClick={fetchPendingEvents}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending approval</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{events.length}</p>
        </div>

        {loading && <p className="text-gray-600">Loading pending events...</p>}
        {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">No pending events</h2>
            <p className="mt-2 text-gray-600">New event submissions will appear here.</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <article key={event._id} className="rounded-xl bg-white p-5 shadow-sm">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="mb-4 h-44 w-full rounded-lg object-cover"
                />
              )}

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                  Pending
                </span>
                <span className="text-sm text-gray-500">{event.category}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-gray-600">{event.description}</p>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p><strong>Date:</strong> {event.date ? new Date(event.date).toLocaleDateString() : "Not specified"}</p>
                <p><strong>Time:</strong> {event.time || "Not specified"}</p>
                <p><strong>Location:</strong> {event.location || "Not specified"}</p>
                <p>
                  <strong>Submitted by:</strong>{" "}
                  {event.createdBy?.name || event.createdBy?.email || "Organizer"}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => approveEvent(event._id)}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectEvent(event._id)}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
