import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { LoginPage } from './pages/LoginPage'
import { ParentPortal } from './pages/parent/ParentPortal'
import { CourseReport } from './pages/student/CourseReport'
import { StudentHome } from './pages/student/StudentHome'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/student"
            element={
              <RequireAuth roles={['student']}>
                <StudentHome />
              </RequireAuth>
            }
          />
          <Route
            path="/student/course/:courseId"
            element={
              <RequireAuth roles={['student', 'parent']}>
                <CourseReport />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher"
            element={
              <RequireAuth roles={['teacher']}>
                <TeacherDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={['admin']}>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/parent"
            element={
              <RequireAuth roles={['parent']}>
                <ParentPortal />
              </RequireAuth>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
