import './App.css'
import "@radix-ui/themes/styles.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Approuter } from './components/approuter/Approuter';
import { Footer } from './components/footer/Footer';
import { NavBar } from './components/navbar/Navbar';
import { ToastContainer } from './components/ui/Toast';
import { LOGIN_ROUTE, REGISTRATION_ROUTE, FORGOT_PASSWORD_ROUTE, VERIFY_CODE_ROUTE, RESET_PASSWORD_ROUTE } from './utils/consts';

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === LOGIN_ROUTE || location.pathname === REGISTRATION_ROUTE || location.pathname === FORGOT_PASSWORD_ROUTE || location.pathname === VERIFY_CODE_ROUTE || location.pathname === RESET_PASSWORD_ROUTE;

  // Прокручиваем страницу вверх при изменении маршрута
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Мгновенная прокрутка без анимации
    });
  }, [location.pathname]);

  return (
    <>
      {!hideNavAndFooter && <NavBar/>}
      <Approuter/>
      {!hideNavAndFooter && <Footer/>}
      <ToastContainer />
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
