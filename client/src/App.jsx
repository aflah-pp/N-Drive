import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/app-layout';
import Assistant from './pages/AI/Assistant';
import { ImageStudio } from './pages/AI/ImageGenPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TrashPage from './pages/Bin/BinPage';
import { Overview } from './pages/DashBoard';
import FilesPage from './pages/Files/FilesPage';
import HelpPage from './pages/HelpPage';
import NotFound from './pages/NotFound';
import PlansPage from './pages/Plan';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/Settings';
import BillingPage from './pages/Transactions/InvoicesPage';
import PaymentPage from './pages/Transactions/PaymentPage';
import PaymentResultPage from './pages/Transactions/PaymentResult';
import ProfilePage from './pages/UserProfile';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/ai/chat" element={<Assistant />} />
            <Route path="/ai/studio" element={<ImageStudio />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/invoice" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/look" element={<SearchPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
