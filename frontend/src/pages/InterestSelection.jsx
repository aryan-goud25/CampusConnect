import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Technical",
    description: "Hackathons, coding contests, AI and technology",
    icon: "💻",
  },
  {
    name: "Cultural",
    description: "Festivals, music, dance and cultural events",
    icon: "🎭",
  },
  {
    name: "Educational",
    description: "Seminars, guest lectures and academic events",
    icon: "📚",
  },
  {
    name: "Sports",
    description: "Sports tournaments, games and fitness",
    icon: "🏆",
  },
  {
    name: "Other",
    description: "Social activities and other campus events",
    icon: "🌟",
  },
];

export default function InterestSelection() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInterests = async () => {
      if (!token) {
        setError("Please log in to select your interests.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/interests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSelected(response.data.interests || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your interests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [token]);

  const toggleInterest = (interest) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
    setMessage("");
    setError("");
  };

  const saveInterests = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.put(
        "http://localhost:5000/api/interests",
        { interests: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelected(response.data.interests);
      setMessage("Your interests have been saved successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your interests."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading your interests...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-gray-700">
          Please log in to select your interests.
        </p>
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Choose Your Interests
          </h1>
          <p className="text-gray-600">
            Select the types of college events you enjoy.
            We'll use these to personalize your event feed.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-600">
            {selected.length} selected
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {categories.map((category) => {
            const isSelected = selected.includes(category.name);

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => toggleInterest(category.name)}
                aria-pressed={isSelected}
                className={`rounded-xl border-2 p-6 text-left transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-4xl">{category.icon}</span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>

                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>

        {message && (
          <p className="mt-5 text-center font-medium text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 text-center font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={saveInterests}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Interests"}
          </button>

          <Link
            to="/events"
            className="text-sm text-blue-600 hover:underline"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
}