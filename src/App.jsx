import { useEffect, useMemo, useState } from 'react'

function StarRating({ value = 0 }) {
  const clamped = Math.max(0, Math.min(10, value))
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${clamped}/10`}>
      <span className="text-yellow-500 font-semibold">{clamped}</span>
      <span className="text-gray-500">/ 10</span>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
      {review.poster_url ? (
        <img src={review.poster_url} alt={`${review.title} poster`} className="w-28 h-40 object-cover hidden sm:block" />
      ) : null}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
          <StarRating value={review.rating} />
        </div>
        {review.watched_on && (
          <p className="text-xs text-gray-500 mt-1">Watched on {new Date(review.watched_on).toLocaleDateString()}</p>
        )}
        <p className="text-sm text-gray-700 mt-3 line-clamp-4">{review.review}</p>
        {review.tags && review.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.tags.map((t, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState({
    title: '',
    rating: 7,
    review: '',
    watched_on: '',
    poster_url: '',
    tags: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/reviews`)
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        review: form.review.trim(),
        rating: Number(form.rating),
        watched_on: form.watched_on || null,
        poster_url: form.poster_url || null,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : null,
      }

      if (!payload.title || !payload.review) {
        throw new Error('Please provide at least a title and your review.')
      }
      if (Number.isNaN(payload.rating) || payload.rating < 0 || payload.rating > 10) {
        throw new Error('Rating must be between 0 and 10')
      }

      const res = await fetch(`${baseUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || 'Failed to save review')
      }

      setSuccess('Saved!')
      setForm({ title: '', rating: 7, review: '', watched_on: '', poster_url: '', tags: '' })
      await loadReviews()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Movie Reviews</h1>
          <a href="/test" className="text-sm text-blue-600 hover:underline">Check Backend</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-6 md:grid-cols-5">
        <section className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add a Review</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input name="title" value={form.title} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Movie title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (0-10)</label>
                <input type="number" name="rating" min={0} max={10} value={form.rating} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Watched on</label>
                <input type="date" name="watched_on" value={form.watched_on} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poster URL</label>
              <input name="poster_url" value={form.poster_url} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="action, sci-fi, classic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Review</label>
              <textarea name="review" value={form.review} onChange={onChange} rows={5} className="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Share your thoughts..." />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-md transition-colors">
              {submitting ? 'Saving...' : 'Save Review'}
            </button>
          </form>
        </section>

        <section className="md:col-span-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Reviews</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">No reviews yet. Add your first one!</div>
          ) : (
            <div className="grid gap-4">
              {items.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
        Built for you. All data is stored privately in your project database.
      </footer>
    </div>
  )
}
