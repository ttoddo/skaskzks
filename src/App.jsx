import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Scenarios from './pages/Scenarios'
import Models from './pages/Models'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CreateGame from './pages/CreateGame'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Payment from './pages/Payment'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="scenarios" element={<Scenarios />} />
        <Route path="models" element={<Models />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="create" element={<CreateGame />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment" element={<Payment />} />
          <Route path="lobby/:id" element={<Lobby />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="game/:id" element={<Game />} />
      </Route>
    </Routes>
  )
}
