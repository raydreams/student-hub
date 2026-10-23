import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { StudentHubLayout } from './components/student/StudentHubLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { LoginPage } from './pages/LoginPage'
import { ParentPortal } from './pages/parent/ParentPortal'
import { CourseReport } from './pages/student/CourseReport'
import { StudentCourses } from './pages/student/StudentCourses'
import { StudentHome } from './pages/student/StudentHome'
import { StudentInbox } from './pages/student/StudentInbox'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Student Hub Routes with Layout */}
          <Route
            path="/student"
            element={
              <RequireAuth roles={['student', 'parent']}>
                <StudentHubLayout />
              </RequireAuth>
            }
          >
            <Route index element={<StudentHome />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="course/:courseId" element={<CourseReport />} />
            <Route path="inbox" element={<StudentInbox />} />
          </Route>

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
