
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EventCard from "../components/EventCard";

function MyBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token) {
        setError("Please log in to view your bookmarks.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://campusconnect-backend-r9m6.onrender.com/api/bookmarks/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBookmarks(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load bookmarks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token]);

  const handleRemove = async (eventId) => {
    try {
      await axios.delete(
        `https://campusconnect-backend-r9m6.onrender.com/api/bookmarks/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookmarks((previous) =>
        previous.filter((item) => item.event?._id !== eventId)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove bookmark.");
    }
  };

  if (loading) {
    return <p className="p-10 text-center">Loading your bookmarks...</p>;
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        {!token && (
          <Link to="/login" className="font-semibold text-blue-600">
            Log In
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          My Bookmarks
        </h1>
        <p className="mb-8 text-gray-600">
          Events you have saved for later.
        </p>

        {bookmarks.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="mb-4 text-lg text-gray-600">
              You haven't bookmarked any events yet.
            </p>
            <Link
              to="/events"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) =>
              bookmark.event ? (
                <div key={bookmark._id} className="relative">
                  <EventCard event={bookmark.event} />
                  <button
                    onClick={() => handleRemove(bookmark.event._id)}
                    className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 py-2 font-semibold text-red-600 hover:bg-red-100"
                  >
                    Remove from Bookmarks
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookmarks;