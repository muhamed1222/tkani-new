import './App.css'
import "@radix-ui/themes/styles.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Approuter } from './components/approuter/Approuter';
import { Footer } from './components/footer/Footer';
import { NavBar } from './components/navbar/Navbar';
import { LOGIN_ROUTE, REGISTRATION_ROUTE, FORGOT_PASSWORD_ROUTE, VERIFY_CODE_ROUTE, RESET_PASSWORD_ROUTE } from './utils/consts';

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === LOGIN_ROUTE || location.pathname === REGISTRATION_ROUTE || location.pathname === FORGOT_PASSWORD_ROUTE || location.pathname === VERIFY_CODE_ROUTE || location.pathname === RESET_PASSWORD_ROUTE;

  return (
    <>
      {!hideNavAndFooter && <NavBar/>}
      <Approuter/>
      {!hideNavAndFooter && <Footer/>}
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  )
}

export default App
