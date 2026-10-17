import { Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
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
    <div className="min-h-dvh bg-slate-900 text-slate-200">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">
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
      <BottomNav />
    </div>
  )
}
