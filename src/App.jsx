import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Session from './pages/Session'
import Portfolio from './pages/Portfolio'
import Teacher from './pages/Teacher'

export default function App() {
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('student')
    if (saved) {
      try { setStudent(JSON.parse(saved)) } catch {}
    }
  }, [])

  const login = (studentData) => {
    setStudent(studentData)
    sessionStorage.setItem('student', JSON.stringify(studentData))
  }

  const logout = () => {
    setStudent(null)
    sessionStorage.removeItem('student')
  }

  return (
    <Routes>
      <Route path="/" element={
        student ? <Navigate to="/home" replace /> : <Login onLogin={login} />
      } />
      <Route path="/home" element={
        student ? <Home student={student} onLogout={logout} /> : <Navigate to="/" replace />
      } />
      <Route path="/session/:id" element={
        student ? <Session student={student} /> : <Navigate to="/" replace />
      } />
      <Route path="/portfolio" element={
        student ? <Portfolio student={student} onLogout={logout} /> : <Navigate to="/" replace />
      } />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

