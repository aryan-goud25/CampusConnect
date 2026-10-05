
import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";

function Events() {
  const [events, setEvents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Technical",
    "Cultural",
    "Educational",
    "Sports",
    "Other",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://campusconnect-backend-r9m6.onrender.com/api/events"
        );
        setEvents(response.data);

        const user = JSON.parse(
          localStorage.getItem("user") || "null"
        );
        const token = localStorage.getItem("token");

        if (user?.role === "student" && token) {
          try {
            const interestResponse = await axios.get(
              "https://campusconnect-backend-r9m6.onrender.com/api/interests",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setInterests(
              Array.isArray(interestResponse.data.interests)
                ? interestResponse.data.interests
                : []
            );
          } catch (interestError) {
            console.error(
              "Unable to fetch student interests:",
              interestError
            );
          }
        }
      } catch (err) {
        setError("Unable to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(searchText) ||
      event.description?.toLowerCase().includes(searchText) ||
      event.location?.toLowerCase().includes(searchText) ||
      event.category?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  const recommendedEvents = filteredEvents.filter((event) =>
    interests.includes(event.category)
  );

  const otherEvents = filteredEvents.filter(
    (event) => !interests.includes(event.category)
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">
            Explore Events
          </h1>
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
            Discover workshops, cultural activities, competitions
            and other events happening on campus.
          </p>
        </div>

        <div className="mb-5 sm:mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-base"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition sm:px-5 sm:text-sm ${
                category === item
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-600">
            Loading events...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600 sm:p-5 sm:text-base">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-5">
              <p className="text-sm text-gray-600">
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"} found
              </p>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-center shadow-sm sm:p-10">
                <h2 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                  No events found
                </h2>
                <p className="mb-4 text-sm text-gray-600 sm:text-base">
                  Try another search term or category.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="min-h-11 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {recommendedEvents.length > 0 && (
                  <section className="mb-8 sm:mb-10">
                    <div className="mb-4 sm:mb-5">
                      <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Recommended for You
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 sm:text-base">
                        Events matching your selected interests.
                      </p>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {recommendedEvents.map((event) => (
                        <EventCard
                          key={event._id}
                          event={event}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {otherEvents.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-gray-800 sm:mb-5 sm:text-2xl">
                      {recommendedEvents.length > 0
                        ? "Other Events"
                        : "All Events"}
                    </h2>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {otherEvents.map((event) => (
                        <EventCard
                          key={event._id}
                          event={event}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {interests.length === 0 && (
                  <p className="mt-6 text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
                    Select your interests to get personalized event
                    recommendations.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Events;
