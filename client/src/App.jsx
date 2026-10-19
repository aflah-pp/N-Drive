import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppLayout from './components/layout/app-layout';
import { Overview } from './page';
import Assistant from './pages/Assistant';
import TrashPage from './pages/BinPage';
import FilesPage from './pages/FilesPage';
import HelpPage from './pages/HelpPage';
import ImagesPage from './pages/ImageGenPage';
import BillingPage from './pages/InvoicesPage';
import NotFound from './pages/NotFound';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResult';
import PlansPage from './pages/PLan';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/Seettings';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/ai/chat" element={<Assistant />} />
          <Route path="/ai/studio" element={<ImagesPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/invoice" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/look" element={<SearchPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
          <Route path="/payment/failed" element={<PaymentResultPage status="failed" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={4000} />
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
