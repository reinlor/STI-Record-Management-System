import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import UserManager from './component/UserManager.jsx';
import Register from './component/Register.jsx';
import Upload from './component/Upload.jsx';


function App() {

  return (
    // DITO YUNG ROUTER MGA 🥷
    <Router>
      <Routes>
        <Route path='/' element={<UserManager/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/upload" element={<Upload/>}/>
      </Routes>
    </Router>
  )
}

export default App
