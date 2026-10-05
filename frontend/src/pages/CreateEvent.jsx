
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function CreateEvent() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    date: "",
    time: "",
    location: "",
    image: "",
    organizer: "CampusConnect",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

   
    try {
      const token = localStorage.getItem("token")

      await axios.post(
        "http://localhost:5000/api/events",
        {
          ...form,
          date: new Date(form.date).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Event created successfully!")
      navigate("/events")
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create event.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block font-medium">Event Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full rounded-lg border p-3"
              placeholder="Describe your event"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              {["Technical", "Cultural", "Educational", "Sports", "Other"].map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
              placeholder="Enter venue"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Image URL (optional)</label>
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
