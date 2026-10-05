import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://campusconnect-backend-r9m6.onrender.com";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in with your organizer account.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/analytics/organizer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // =====================================================
  // DOWNLOAD CSV
  // =====================================================
  const downloadCSV = () => {
    if (!analytics || !analytics.events.length) return;

    const headers = [
      "Event",
      "Category",
      "Date",
      "Location",
      "Registrations",
      "Attended",
      "Cancelled",
      "Attendance Rate",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = analytics.events.map((event) => [
      event.title,
      event.category,
      event.date
        ? new Date(event.date).toLocaleDateString("en-IN")
        : "",
      event.location,
      event.totalRegistrations,
      event.attended,
      event.cancelled,
      `${event.attendanceRate}%`,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "campusconnect-analytics.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // VIEW PARTICIPANTS
  // =====================================================
  const viewParticipants = async (event) => {
    setSelectedEvent(event);
    setParticipants(null);
    setParticipantsError("");
    setParticipantsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setParticipantsError("Please log in again.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/analytics/organizer/event/${event._id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setParticipants(response.data);
    } catch (err) {
      setParticipantsError(
        err.response?.data?.message ||
          "Unable to load participants."
      );
    } finally {
      setParticipantsLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD EXCEL
  // =====================================================
  const downloadExcel = async (event) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/analytics/organizer/event/${event._id}/excel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.download = `${event.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-participants.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Unable to download Excel report.");
    }
  };

  // =====================================================
  // EVENT STATUS
  // =====================================================
  const getEventStatus = (event) => {
    if (!event.date) return "upcoming";

    const eventDate = new Date(event.date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (eventDate > today) {
      return "upcoming";
    }

    if (eventDate < today) {
      return "past";
    }

    return "ongoing";
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12 text-center">
        <p className="font-medium text-red-600">{error}</p>

        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  // =====================================================
  // SUMMARY CARDS
  // =====================================================
  const cards = [
    {
      title: "Total Events",
      value: analytics.totalEvents,
    },
    {
      title: "Registrations",
      value: analytics.totalRegistrations,
    },
    {
      title: "Students Attended",
      value: analytics.totalAttended,
    },
    {
      title: "Attendance Rate",
      value: `${analytics.attendanceRate}%`,
    },
  ];

  // =====================================================
  // CHART
  // =====================================================
  const maxRegistrations = Math.max(
    1,
    ...analytics.events.map(
      (event) => event.totalRegistrations
    )
  );

  // =====================================================
  // EVENT GROUPS
  // =====================================================
  const upcomingEvents = analytics.events.filter(
    (event) => getEventStatus(event) === "upcoming"
  );

  const ongoingEvents = analytics.events.filter(
    (event) => getEventStatus(event) === "ongoing"
  );

  const pastEvents = analytics.events.filter(
    (event) => getEventStatus(event) === "past"
  );

  // =====================================================
  // EVENT CARD
  // =====================================================
  const EventCard = ({ event, showPast = false }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {event.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {event.category}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            📅{" "}
            {event.date
              ? new Date(event.date).toLocaleDateString("en-IN")
              : "No date"}
          </p>

          <p className="text-sm text-gray-500">
            📍 {event.location}
          </p>
        </div>

        {showPast && (
          <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Past Event
          </span>
        )}
      </div>

      {/* EVENT STATS */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-gray-500">Registered</p>

          <p className="mt-1 text-xl font-bold text-blue-700">
            {event.totalRegistrations}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-gray-500">Attended</p>

          <p className="mt-1 text-xl font-bold text-green-700">
            {event.attended}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-gray-500">Cancelled</p>

          <p className="mt-1 text-xl font-bold text-red-700">
            {event.cancelled}
          </p>
        </div>

        <div className="rounded-lg bg-purple-50 p-3">
          <p className="text-xs text-gray-500">Attendance</p>

          <p className="mt-1 text-xl font-bold text-purple-700">
            {event.attendanceRate}%
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => viewParticipants(event)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          👥 View Participants
        </button>

        <button
          onClick={() => downloadExcel(event)}
          className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
        >
          📊 Download Excel
        </button>
      </div>
    </div>
  );

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Analytics
            </h1>

            <p className="mt-2 text-gray-600">
              Track your events, registrations and attendance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              onClick={downloadCSV}
              disabled={!analytics.events.length}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↓ Download CSV
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* EVENT REGISTRATION CHART */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Event Registration Chart
          </h2>

          {analytics.events.length === 0 ? (
            <p className="py-6 text-center text-gray-500">
              No event data available to display.
            </p>
          ) : (
            <div className="space-y-5">
              {analytics.events.map((event) => (
                <div key={event._id}>
                  <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                      {event.title}
                    </span>

                    <span className="text-gray-500">
                      {event.totalRegistrations} registrations
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${
                          (event.totalRegistrations /
                            maxRegistrations) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING EVENTS */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h2>

            <p className="text-sm text-gray-500">
              Events that are scheduled for the future.
            </p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              No upcoming events.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                />
              ))}
            </div>
          )}
        </div>

        {/* ONGOING EVENTS */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Ongoing Events
            </h2>
          </div>

          {ongoingEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              No ongoing events today.
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAST EVENTS */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Past Events
            </h2>

            <p className="text-sm text-gray-500">
              View previous events and their participation records.
            </p>
          </div>

          {pastEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              No past events.
            </div>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  showPast
                />
              ))}
            </div>
          )}
        </div>

        {/* PARTICIPANTS MODAL */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Participants
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedEvent.title}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setParticipants(null);
                    setParticipantsError("");
                  }}
                  className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="max-h-[70vh] overflow-y-auto p-5">

                {participantsLoading && (
                  <p className="py-10 text-center text-gray-500">
                    Loading participants...
                  </p>
                )}

                {participantsError && (
                  <p className="rounded-lg bg-red-50 p-4 text-center text-red-600">
                    {participantsError}
                  </p>
                )}

                {participants && !participantsLoading && (
                  <>
                    {/* PARTICIPANT SUMMARY */}
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm text-gray-500">
                          Participants
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-700">
                          {participants.totalParticipants}
                        </p>
                      </div>

                      <div className="rounded-lg bg-green-50 p-4">
                        <p className="text-sm text-gray-500">
                          Attended
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-700">
                          {participants.attended}
                        </p>
                      </div>

                      <div className="rounded-lg bg-purple-50 p-4">
                        <p className="text-sm text-gray-500">
                          Attendance Rate
                        </p>

                        <p className="mt-1 text-2xl font-bold text-purple-700">
                          {participants.totalParticipants
                            ? (
                                (participants.attended /
                                  participants.totalParticipants) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>

                    {/* PARTICIPANT TABLE */}
                    {participants.participants.length === 0 ? (
                      <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                        No students have registered for this event yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-gray-600">
                                #
                              </th>

                              <th className="px-4 py-3 font-semibold text-gray-600">
                                Student Name
                              </th>

                              <th className="px-4 py-3 font-semibold text-gray-600">
                                Email
                              </th>

                              <th className="px-4 py-3 font-semibold text-gray-600">
                                Registration
                              </th>

                              <th className="px-4 py-3 font-semibold text-gray-600">
                                Attendance
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {participants.participants.map(
                              (student, index) => (
                                <tr key={student.registrationId}>
                                  <td className="px-4 py-3 text-gray-500">
                                    {index + 1}
                                  </td>

                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {student.name}
                                  </td>

                                  <td className="px-4 py-3 text-gray-600">
                                    {student.email}
                                  </td>

                                  <td className="px-4 py-3">
                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                      {student.status}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3">
                                    {student.attended ? (
                                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                        Attended
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                        Not Attended
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 p-5">
                <button
                  onClick={() => downloadExcel(selectedEvent)}
                  className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                >
                  📊 Download Excel
                </button>

                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setParticipants(null);
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;