
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function EventCard({ event }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isStudent = user?.role === "student";

  useEffect(() => {
    const checkBookmark = async () => {
      if (!token || !isStudent) return;

      try {
        const response = await axios.get(
          "https://campusconnect-backend-r9m6.onrender.com/api/bookmarks/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const saved = response.data.some(
          (item) => item.event?._id === event._id
        );

        setIsBookmarked(saved);
      } catch (error) {
        console.error("Could not load bookmark status:", error);
      }
    };

    checkBookmark();
  }, [event._id, token, isStudent]);

  const handleBookmark = async () => {
    if (!token || !isStudent || loading) return;

    setLoading(true);

    try {
      if (isBookmarked) {
        await axios.delete(
          `https://campusconnect-backend-r9m6.onrender.com/api/bookmarks/${event._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsBookmarked(false);
      } else {
        await axios.post(
          `https://campusconnect-backend-r9m6.onrender.com/api/bookmarks/${event._id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark action failed:", error);
      alert(error.response?.data?.message || "Could not update bookmark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl sm:hover:-translate-y-1">
      <img
        src={event.image || "https://placehold.co/600x400?text=CampusConnect"}
        alt={event.title}
        className="h-40 w-full object-cover sm:h-48"
      />

      <div className="p-4 sm:p-5">
        <span className="inline-block max-w-full break-words rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
          {event.category}
        </span>

        <h2 className="mt-3 break-words text-lg font-bold leading-snug text-gray-800 sm:text-xl">
          {event.title}
        </h2>

        <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">
          {event.description}
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <p className="break-words">📅 {event.date}</p>
          <p className="break-words">🕒 {event.time}</p>
          <p className="break-words">📍 {event.location}</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            to={`/events/${event._id}`}
            className="block min-h-11 w-full rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:py-2 sm:text-base"
          >
            View Details
          </Link>

          {isStudent ? (
            <button
              onClick={handleBookmark}
              disabled={loading}
              className={`min-h-11 w-full rounded-lg border px-3 py-3 text-sm font-semibold transition disabled:opacity-60 sm:py-2 sm:text-base ${
                isBookmarked
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              {loading
                ? "Please wait..."
                : isBookmarked
                ? "♥ Remove Bookmark"
                : "♡ Bookmark Event"}
            </button>
          ) : !token ? (
            <Link
              to="/login"
              className="block min-h-11 w-full rounded-lg border border-blue-200 px-3 py-3 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:py-2 sm:text-base"
            >
              Log in to Bookmark
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
