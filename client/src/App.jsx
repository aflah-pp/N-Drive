import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaymentStatus from './pages/payment/PaymentStatus'
import PaymentInitiating from './pages/payment/PaymentInitiating'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import FileManager from './pages/home/FileManager'
import UserProfile from './pages/profile/UserProfile'
import ImgGen from './pages/img-gen/ImgGen'
import BillingPageLayout from './pages/billing/BillingPageLayout'
import DocumentationPage from './pages/doc/DocumentationPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatAI from './pages/chatAi/chatai'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FileManager />} />
            <Route path="/chat" element={<ChatAI />} />
            <Route path="/img-gen" element={<ImgGen />} />
            <Route path="/payment" element={<PaymentInitiating />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/pricing" element={<BillingPageLayout />} />
            <Route path="/doc" element={<DocumentationPage />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={4000} />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
