
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/registrations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRegistrations(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load registrations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-base text-gray-600 sm:text-lg">
        Loading your registrations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-10 text-center text-sm text-red-600 sm:text-base">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <h1 className="mb-6 break-words text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">
          My Registrations
        </h1>

        {registrations.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow sm:p-8">
            <p className="mb-4 text-sm text-gray-600 sm:text-base">
              You haven't registered for any events yet.
            </p>
            <Link
              to="/events"
              className="inline-flex min-h-11 items-center font-medium text-blue-600 hover:underline"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {registrations.map((registration) => {
              const event = registration.event;

              if (!event) return null;

              return (
                <div
                  key={registration._id}
                  className="w-full min-w-0 overflow-hidden rounded-xl bg-white p-4 shadow sm:p-6"
                >
                  <h2 className="mb-2 break-words text-lg font-bold leading-snug text-gray-900 sm:text-xl">
                    {event.title}
                  </h2>

                  <p className="break-words text-sm text-gray-600 sm:text-base">
                    {event.category}
                  </p>

                  <p className="mt-2 break-words text-sm leading-relaxed text-gray-600 sm:text-base">
                    {new Date(event.date).toLocaleDateString("en-IN")}
                    {event.time ? ` · ${event.time}` : ""}
                  </p>

                  <p className="mt-1 break-words text-sm text-gray-600 sm:text-base">
                    {event.location}
                  </p>

                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                    <strong>Status:</strong>
                    <span
                      className={`break-words font-medium capitalize ${
                        registration.status === "attended"
                          ? "text-green-600"
                          : registration.status === "cancelled"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </p>

                  {registration.status !== "cancelled" &&
                    registration.qrToken && (
                      <div className="mt-5 flex min-w-0 flex-col items-center rounded-lg border border-gray-200 p-3 sm:p-4">
                        <p className="mb-3 text-center text-sm font-semibold text-gray-800 sm:text-base">
                          Your Event QR Pass
                        </p>

                        <div className="max-w-full overflow-hidden">
                          <QRCodeSVG
                            value={registration.qrToken}
                            size={160}
                            level="H"
                            includeMargin
                          />
                        </div>

                        <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
                          Show this QR code to the organizer at the event.
                        </p>
                      </div>
                    )}

                  {!registration.qrToken &&
                    registration.status !== "cancelled" && (
                      <p className="mt-4 break-words text-sm leading-relaxed text-amber-700">
                        QR pass unavailable for this older registration.
                      </p>
                    )}

                  <Link
                    to={`/events/${event._id}`}
                    className="mt-4 inline-flex min-h-11 items-center font-medium text-blue-600 hover:underline sm:mt-5"
                  >
                    View Event
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
