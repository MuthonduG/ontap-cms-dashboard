import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from "./routing"; // Make sure this import path is correct
import SideNavComponent from './components/sidenav/SideNavComponent';

function App() {
  return (
    <>
      <Router>
        <SideNavComponent/>
        <Routes>
          {routes.map((route, index) => (
            <Route 
              key={index} 
              path={route.path} 
              element={route.element} 
            />
          ))}
        </Routes>
      </Router>
    </>
  )
}

export default App