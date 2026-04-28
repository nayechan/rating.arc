import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import ProblemList from './pages/ProblemList'
import UserSearch from './pages/UserSearch'
import UserProfile from './pages/UserProfile'

function NavBar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? 'border-blue-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
    }`

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
        <span className="text-base font-bold text-white py-3 mr-2">rating.arc</span>
        <nav className="flex">
          <NavLink to="/" end className={linkClass}>Problems</NavLink>
          <NavLink to="/user" className={linkClass}>User</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/rating.arc">
      <div className="min-h-screen bg-gray-950">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ProblemList />} />
            <Route path="/user" element={<UserSearch />} />
            <Route path="/user/:userId" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
