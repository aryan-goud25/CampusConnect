
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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
        "https://campusconnect-backend-r9m6.onrender.com/api/analytics/organizer",
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

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

  const cards = [
    { title: "Total Events", value: analytics.totalEvents },
    { title: "Registrations", value: analytics.totalRegistrations },
    { title: "Students Attended", value: analytics.totalAttended },
    { title: "Attendance Rate", value: `${analytics.attendanceRate}%` },
  ];

  const maxRegistrations = Math.max(
    1,
    ...analytics.events.map((event) => event.totalRegistrations)
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
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
                          (event.totalRegistrations / maxRegistrations) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Event-wise Reports
          </h2>

          {analytics.events.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              You have not created any events yet.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-4 font-semibold">Event</th>
                      <th className="px-4 py-4 font-semibold">Category</th>
                      <th className="px-4 py-4 font-semibold">Registrations</th>
                      <th className="px-4 py-4 font-semibold">Attended</th>
                      <th className="px-4 py-4 font-semibold">Cancelled</th>
                      <th className="px-4 py-4 font-semibold">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analytics.events.map((event) => (
                      <tr key={event._id}>
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {event.title}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {event.category}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {event.totalRegistrations}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {event.attended}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {event.cancelled}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {event.attendanceRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 md:hidden">
                {analytics.events.map((event) => (
                  <div key={event._id} className="space-y-3 py-5">
                    <h3 className="font-semibold text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {event.category}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p className="text-gray-600">
                        Registrations:{" "}
                        <strong className="text-gray-900">
                          {event.totalRegistrations}
                        </strong>
                      </p>
                      <p className="text-gray-600">
                        Attended:{" "}
                        <strong className="text-gray-900">
                          {event.attended}
                        </strong>
                      </p>
                      <p className="text-gray-600">
                        Cancelled:{" "}
                        <strong className="text-gray-900">
                          {event.cancelled}
                        </strong>
                      </p>
                      <p className="text-gray-600">
                        Attendance:{" "}
                        <strong className="text-gray-900">
                          {event.attendanceRate}%
                        </strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
