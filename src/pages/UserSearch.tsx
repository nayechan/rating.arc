import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserSearch() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = input.trim()
    if (id) navigate(`/user/${id}`)
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <h1 className="text-2xl font-bold text-white">User Profile</h1>
      <p className="text-gray-400 text-sm">Enter an AtCoder user ID to view their statistics.</p>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AtCoder User ID"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  )
}
