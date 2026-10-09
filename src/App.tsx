import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import PredictorPage from './pages/PredictorPage'
import RankingPage from './pages/RankingPage'
import TeamsPage from './pages/TeamsPage'
import AdminPage from './pages/AdminPage'
import CalendarPage from './pages/CalendarPage'
import BettingPage from './pages/BettingPage'
import LoginPage from './pages/LoginPage'
import MatchDetail from './betting/MatchDetail'
import MatchList from './betting/MatchList'
import MyBets from './betting/MyBets'
import Recommendations from './betting/Recommendations'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/predict" element={<PredictorPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/betting" element={<BettingPage />}>
            <Route index element={<MatchList />} />
            <Route path="partido/:eventId" element={<MatchDetail />} />
            <Route path="recomendaciones" element={<Recommendations />} />
            <Route path="mis-apuestas" element={<MyBets />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
