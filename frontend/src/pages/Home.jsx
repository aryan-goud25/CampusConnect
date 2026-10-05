
import { Link } from "react-router-dom"
import { ArrowRight, Search, CalendarDays, Users } from "lucide-react"
import events from "../data/events"
import EventCard from "../components/EventCard"

function Home() {
  const featuredEvents = events.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
            Your Campus. Your Events.
          </span>

          <h1 className="mt-6 text-4xl font-bold md:text-6xl">
            Discover What's Happening
            <br />
            on Your Campus
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Find college events, explore your interests, and never miss
            an opportunity to learn, connect, and grow.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              Explore Events <ArrowRight size={18} />
            </Link>

            <button className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10">
              Join CampusConnect
            </button>
          </div>

          <div className="mt-12 flex justify-center gap-10">
            <div className="flex items-center gap-2">
              <CalendarDays size={24} />
              <span>College Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={24} />
              <span>Student Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Events
            </h2>
            <p className="mt-2 text-gray-600">
              Explore events happening in your campus.
            </p>
          </div>

          <Link
            to="/events"
            className="hidden items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 sm:flex"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/events"
            className="font-semibold text-blue-600"
          >
            View All Events →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home