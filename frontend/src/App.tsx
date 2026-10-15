import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HeatRiskDetailPage } from './pages/HeatRiskDetailPage';
import { HydrationPage } from './pages/HydrationPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { GuidanceLibraryPage } from './pages/GuidanceLibraryPage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { WorksiteManagementPage } from './pages/WorksiteManagementPage';
import { IncidentReportingPage } from './pages/IncidentReportingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/heat-risk" element={<HeatRiskDetailPage />} />
                  <Route path="/hydration" element={<HydrationPage />} />
                  <Route path="/facilities" element={<FacilitiesPage />} />
                  <Route path="/assistant" element={<VoiceAssistantPage />} />
                  <Route path="/guidance" element={<GuidanceLibraryPage />} />
                  <Route path="/employer" element={<EmployerDashboardPage />} />
                  <Route path="/worksites" element={<WorksiteManagementPage />} />
                  <Route path="/incidents" element={<IncidentReportingPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfileSettingsPage />} />
                  <Route path="/settings" element={<ProfileSettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
