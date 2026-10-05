
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import axios from "axios";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState(false);

  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/events/${id}`
        );

        setEvent(response.data);

        const currentToken = localStorage.getItem("token");
        let currentUser = null;

        try {
          currentUser = JSON.parse(
            localStorage.getItem("user") || "null"
          );
        } catch {
          currentUser = null;
        }

        if (currentToken && currentUser?.role === "student") {
          const registrationResponse = await axios.get(
            "http://localhost:5000/api/registrations/my",
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            }
          );

          const alreadyRegistered =
            registrationResponse.data.some(
              (registration) =>
                registration.event?._id === response.data._id &&
                registration.status === "registered"
            );

          setRegistered(alreadyRegistered);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setMessage("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRegister = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "student") {
      setMessage("Only student accounts can register for events.");
      return;
    }

    setRegistering(true);
    setMessage("");

    try {
      await axios.post(
        `http://localhost:5000/api/registrations/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRegistered(true);
      setMessage("Successfully registered for the event!");
    } catch (error) {
      if (error.response?.status === 409) {
        setRegistered(true);
        setMessage("You are already registered for this event.");
      } else if (error.response?.status === 401) {
        setMessage("Your session has expired. Please log in again.");
      } else {
        setMessage(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <p className="px-4 py-10 text-center text-gray-600">
        Loading event...
      </p>
    );
  }

  if (!event) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="text-xl font-bold sm:text-2xl">
          Event not found
        </h1>
        <Link
          to="/events"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl min-w-0">
        <Link
          to="/events"
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-blue-600 hover:text-blue-800 sm:mb-6 sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to Events
        </Link>

        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-lg sm:rounded-2xl">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="h-48 w-full object-cover sm:h-72"
            />
          )}

          <div className="p-4 sm:p-8">
            <span className="inline-block max-w-full break-words rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
              {event.category}
            </span>

            <h1 className="mt-3 break-words text-2xl font-bold leading-snug text-gray-900 sm:mt-4 sm:text-3xl">
              {event.title}
            </h1>

            <p className="mt-3 break-words whitespace-pre-line text-sm leading-relaxed text-gray-600 sm:mt-4 sm:text-base">
              {event.description}
            </p>

            <div className="mt-5 space-y-4 text-sm text-gray-700 sm:mt-6 sm:text-base">
              <p className="flex min-w-0 items-start gap-3">
                <CalendarDays
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={20}
                />
                <span className="break-words">{event.date}</span>
              </p>

              <p className="flex min-w-0 items-start gap-3">
                <Clock
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={20}
                />
                <span className="break-words">{event.time}</span>
              </p>

              <p className="flex min-w-0 items-start gap-3">
                <MapPin
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={20}
                />
                <span className="break-words">{event.location}</span>
              </p>
            </div>

            {message && (
              <p className="mt-5 break-words rounded-lg bg-blue-50 p-3 text-sm leading-relaxed text-blue-700">
                {message}
              </p>
            )}

            {user?.role === "student" || !user ? (
              <button
                onClick={handleRegister}
                disabled={registering || registered}
                className={`mt-6 min-h-12 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition sm:mt-8 sm:text-base ${
                  registered
                    ? "cursor-not-allowed bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-70`}
              >
                {registering
                  ? "Registering..."
                  : registered
                  ? "Already Registered"
                  : "Register for Event"}
              </button>
            ) : (
              <p className="mt-6 rounded-lg bg-gray-100 p-3 text-center text-sm leading-relaxed text-gray-600 sm:mt-8 sm:text-base">
                Event registration is available for students.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
