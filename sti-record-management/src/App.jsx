import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect, createContext } from 'react';

import Login from './login/Login.jsx';
import UserManager from './component/UserManager.jsx';
import LoginBeta from './login/LoginBeta.jsx';

import Register from './component/Register.jsx';
import Upload from './component/Upload.jsx';

import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/admin-dashboard/Dashboard.jsx';
import AdminStudentRecords from './pages/Admin/student-records/StudentRecords.jsx';
import AdminStudentLayout from './pages/Admin/student-records/StudentLayout.jsx';
import AdminStudentCases from './pages/Admin/student-cases/StudentCases.jsx';
import AdminUsers from './pages/Admin/users/Users.jsx';
import AdminBackNRestore from './pages/Admin/back-up-and-restore/BackNRestore.jsx';
import WellnessGeneration from './pages/Admin/wellness-assessment/WellnessAssessment.jsx';

import DisciplinaryLayout from './layouts/DisciplinaryLayout.jsx';
import DisciplinaryDashboard from './pages/DisciplinaryOfficer/dashboard/Dashboard.jsx'
import DisciplinaryStudentRecords from './pages/DisciplinaryOfficer/student-records/StudentRecords.jsx'
import DisciplinaryStudentCases from './pages/DisciplinaryOfficer/student-cases/StudentCases.jsx'
import DisciplinaryRequestSlip from './pages/DisciplinaryOfficer/request-slip/RequestSlip.jsx'
import DisciplinaryRequestSlipHistory from './pages/DisciplinaryOfficer/request-slip/RequestSlipHistory.jsx'
import DisciplinaryReferralForm from './pages/DisciplinaryOfficer/referral-form/ReferralForm.jsx'
import DisciplinaryReferralFormHistory from './pages/DisciplinaryOfficer/referral-form/ReferralFormHistory.jsx'
import DisciplinaryBackupNRestore from './pages/DisciplinaryOfficer/backup-and-restore/BackupNRestore.jsx'

import GuidanceLayout from './layouts/AdminLayout.jsx'
import GuidanceDashboard from './pages/GuidancePersonnel/dashboard/Dashboard.jsx'
import GuidanceStudentRecords from './pages/GuidancePersonnel/student-records/StudentRecords.jsx'
import GuidanceStudentCases from './pages/GuidancePersonnel/student-cases/StudentCases.jsx'
import GuidanceReferralForm from './pages/GuidancePersonnel/referral-form/ReferralForm.jsx'
import GuidanceReferralFormHistory from './pages/GuidancePersonnel/referral-form/ReferralFormHistory.jsx'
import GuidanceRequestSlip from './pages/GuidancePersonnel/request-slip/RequestSlip.jsx'
import GuidanceRequestSlipHistory from './pages/GuidancePersonnel/request-slip/RequestSlipHistory.jsx'
import GuidanceUsers from './pages/GuidancePersonnel/users/Users.jsx'
import GuidanceBackNRestore from './pages/GuidancePersonnel/backup-and-restore/BackupNRestore.jsx'
import GuidanceWellnessGeneration from './pages/GuidancePersonnel/wellness-assessment/WellnessAssessment.jsx'

import StudentHomepage from './pages/Student/StudentHomepage.jsx';
import StudentSignup from './pages/Student/StudentSignup.jsx';

import TeacherHomepage from './pages/Teacher/TeacherHomepage.jsx';

import PageNotFound from './pages/Others/PageNotFound.jsx';
import UnauthorizeAccess from './pages/Others/UnauthorizeAccess.jsx';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);


// What the helly yow bat di to naka define       -renlor (genuine question)
import './app.css'  // <- originally nakatangal   -renlor
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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginBeta />} />
          <Route path="/signup" element={<StudentSignup />} />
          <Route path="/userManager" element={<UserManager />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="student-records" element={<AdminStudentLayout />} />
            <Route path="student-cases" element={<AdminStudentCases />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="back-n-restore" element={<AdminBackNRestore />} />
            <Route path="wellness" element={<WellnessGeneration />} />
          </Route>

          {/* Protected Disciplinary Officer Routes */}
          <Route path="/disciplinary" element={<ProtectedRoute requiredRole="Disciplinary"><DisciplinaryLayout /></ProtectedRoute>}>
            <Route index element={<DisciplinaryDashboard />} />
            <Route path="student-records" element={<DisciplinaryStudentRecords />} />
            <Route path="student-cases" element={<DisciplinaryStudentCases />} />
            <Route path="request-slip" element={<DisciplinaryRequestSlip />} />
            <Route path="request-slip-history" element={<DisciplinaryRequestSlipHistory />} />
            <Route path="referral-form" element={<DisciplinaryReferralForm />} />
            <Route path="referral-form-history" element={<DisciplinaryReferralFormHistory />} />
            <Route path="backup-n-restore" element={<DisciplinaryBackupNRestore />} />
          </Route>

          {/* Guidance Personnel */}
          <Route path='/guidance' element={<ProtectedRoute requiredRole={["Admin", "Disciplinary", "Super Admin"]}><GuidanceLayout/></ProtectedRoute>}>
            <Route index element={<GuidanceDashboard/>}/>
            <Route path="student-records" element={<GuidanceStudentRecords/>}/>
            <Route path="student-cases" element={<GuidanceStudentCases/>}/>
            <Route path="users" element={<GuidanceUsers/>}/>
            <Route path="request-slip" element={<GuidanceRequestSlip/>}/>
            <Route path="request-slip-history" element={<GuidanceRequestSlipHistory/>}/>
            <Route path="referral-form" element={<GuidanceReferralForm/>}/>
            <Route path="referral-form-history" element={<GuidanceReferralFormHistory/>}/>
            <Route path="back-n-restore" element={<GuidanceBackNRestore/>}/>
            <Route path="wellness" element={<GuidanceWellnessGeneration/>}/>
          </Route>

          {/* Protected Student Routes */}
          <Route path='/pupil' element={<ProtectedRoute requiredRole="Student"><StudentHomepage /></ProtectedRoute>}/>

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
