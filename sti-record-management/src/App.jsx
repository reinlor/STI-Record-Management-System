import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import SampleComponent from './SampleComponent.jsx';


function App() {

  return (
    // DITO YUNG ROUTER MGA 🥷
    <Router>
      <Routes>
        {/* Sample router intindihin mo nlng 🥷 */}
        <Route path="/" element={<Login/>} />
        <Route path="/sample" element={<SampleComponent/>}/>
      </Routes>
    </Router>
  )
}

export default App
