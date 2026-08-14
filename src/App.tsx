import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HouseholdProvider, useHousehold } from './context/HouseholdContext';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AppShell } from './pages/AppShell';
import { RecurringPage } from './pages/RecurringPage';
import { TodosPage } from './pages/TodosPage';
import './styles/theme.css';

function Gate() {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: householdLoading } = useHousehold();

  if (authLoading) return null;
  if (!user) return <AuthPage />;
  if (householdLoading) return null;
  if (!household) return <OnboardingPage />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/recurring" element={<RecurringPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="*" element={<Navigate to="/recurring" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <Gate />
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
