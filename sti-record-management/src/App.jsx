import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect, createContext } from 'react';

import LoginBeta from './login/LoginBeta.jsx';

import GuidanceLayout from './layouts/AdminLayout.jsx'
import GuidanceDashboard from './pages/GuidancePersonnel/dashboard/Dashboard.jsx'
import GuidanceStudentRecords from './pages/GuidancePersonnel/student-records/StudentList.jsx'
import GuidanceStudentCases from './pages/GuidancePersonnel/student-cases/StudentCases.jsx'
import GuidanceReferralForm from './pages/GuidancePersonnel/referral-form/ReferralForm.jsx'
import GuidanceReferralFormHistory from './pages/GuidancePersonnel/referral-form/ReferralFormHistory.jsx'
import GuidanceRequestSlip from './pages/GuidancePersonnel/request-slip/RequestSlip.jsx'
import GuidanceRequestSlipHistory from './pages/GuidancePersonnel/request-slip/RequestSlipHistory.jsx'
import GuidanceUsers from './pages/GuidancePersonnel/users/Users.jsx'
import GuidanceBackNRestore from './pages/GuidancePersonnel/backup-and-restore/BackupNRestore.jsx'
import GuidanceWellnessGeneration from './pages/GuidancePersonnel/wellness-assessment/WellnessAssessment.jsx'
import GuidanceContentManagement from './pages/GuidancePersonnel/content-management/ContentManagement.jsx'
import GuidanceNotificationPage from './component/GuidanceNotificationPage.jsx';
import GuidanceOffenses from './pages/GuidancePersonnel/offenses/OffensesList.jsx';
import OffensesTab from "./pages/GuidancePersonnel/offenses/OffensesTab";
import ContentManagement from "./pages/GuidancePersonnel/content-management/ContentManagement";
import Users from "./pages/GuidancePersonnel/users/Users";
import BackupNRestore from "./pages/GuidancePersonnel/backup-and-restore/BackupNRestore";

import StudentHomepage from './pages/Student/StudentHomepage.jsx';

import TeacherHomepage from './pages/Teacher/TeacherHomepage.jsx';

import PageNotFound from './pages/Others/PageNotFound.jsx';
import UnauthorizeAccess from './pages/Others/UnauthorizeAccess.jsx';

// For toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// What the helly yow bat di to naka define       -renlor (genuine question)
import './App.css'  // <- originally nakatangal   -renlor
import AuthProvider from './AuthProvider.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch (e) { return null; }
  })();
  const [user, setUser] = useState(stored);

  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginBeta />} />

          {/* Guidance Personnel */}
          <Route path='/guidance' element={<ProtectedRoute requiredRole={["Admin", "Disciplinary", "Super Admin"]}><GuidanceLayout /></ProtectedRoute>}>
            <Route index element={<GuidanceDashboard />} />
            <Route path="student-records" element={<GuidanceStudentRecords />} />
            <Route path="student-cases" element={<GuidanceStudentCases />} />
            <Route path="users" element={<GuidanceUsers />} />
            <Route path="request-slip" element={<GuidanceRequestSlip />} />
            <Route path="request-slip-history" element={<GuidanceRequestSlipHistory />} />
            <Route path="referral-form" element={<GuidanceReferralForm />} />
            <Route path="referral-form-history" element={<GuidanceReferralFormHistory />} />
            <Route path="back-n-restore" element={<GuidanceBackNRestore />} />
            <Route path="wellness" element={<GuidanceWellnessGeneration />} />
            <Route path="content-management" element={<GuidanceContentManagement />} />
            <Route path="notifications" element={<GuidanceNotificationPage />} />
            <Route path="offenses" element={<OffensesTab />} />
            <Route path="content-management" element={<ContentManagement />} />
            <Route path="users" element={<Users />} />
            <Route path="backup-and-restore" element={<BackupNRestore />} />
          </Route>

          {/* Protected Student Routes */}
          <Route path='/pupil' element={<ProtectedRoute requiredRole="Student"><StudentHomepage /></ProtectedRoute>} />

          {/* Protected Teacher Routes */}
          <Route path='/educator' element={<ProtectedRoute requiredRole="Teacher"><TeacherHomepage /></ProtectedRoute>} />

          {/* 404 Not Found */}
          <Route path="*" element={<PageNotFound />} />
          <Route path="/error401" element={<UnauthorizeAccess />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
