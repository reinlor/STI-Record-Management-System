import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './login/Login.jsx';
import UserManager from './component/UserManager.jsx';
import Register from './component/Register.jsx';
import Upload from './component/Upload.jsx';

import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/admin-dashboard/Dashboard.jsx';
import AdminStudentRecords from './pages/Admin/student-records/StudentRecords.jsx';
import AdminStudentLayout from './pages/Admin/student-records/StudentLayout.jsx';
import AdminStudentCases from './pages/Admin/student-cases/StudentCases.jsx';
import AdminUsers from './pages/Admin/users/Users.jsx';
import AdminBackNRestore from './pages/Admin/back-up-and-restore/BackNRestore.jsx';



export default function App() {

  return (
    // DITO YUNG ROUTER MGA 🥷
    <Router>
      <Routes>
        {/* Login Page*/}
        <Route path="/" element={<Login />} />
        <Route path='/userManager' element={<UserManager/>}/>

        {/* Super-Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />}/>
          <Route path="student-records" element={<AdminStudentLayout />}/>
          <Route path="student-cases" element={<AdminStudentCases />}/>
          <Route path="users" element={<AdminUsers />}/>
          <Route path="back-n-restore" element={<AdminBackNRestore />}/>
        </Route>

        {/* Admin */}

        {/* Student */}

        {/* Teacher */}

      </Routes>
    </Router>
  );
}
