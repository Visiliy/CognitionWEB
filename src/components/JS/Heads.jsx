import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../UX/Heads.css";
import logo from "../../assets/logo.jpeg";

const COOKIE_USERNAME = "username";
const COOKIE_REGISTERED = "is_registered";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Heads = ({ openEnterWindow, username: usernameProp, onUsernameClick, isEnterWindowOpen }) => {
  const [username, setUsername] = useState(usernameProp || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (usernameProp) {
      setUsername(usernameProp);
    } else {
      const storedUsername = getCookie(COOKIE_USERNAME);
      const isRegistered = getCookie(COOKIE_REGISTERED) === "true";
      if (storedUsername && isRegistered) {
        setUsername(storedUsername);
      }
    }
  }, [usernameProp]);

  const handleButtonClick = () => {
    if (username) {
      const storedUsername = getCookie(COOKIE_USERNAME);
      const isRegistered = getCookie(COOKIE_REGISTERED) === "true";
      if (storedUsername && isRegistered) {
        navigate("/working_area");
      } else if (onUsernameClick) {
        onUsernameClick();
      }
    } else {
      openEnterWindow();
    }
  };

  return (
    <header className="heads-wrapper" role="banner">
      <div className="heads-logo-wrapper" role="img" aria-label="Cognition logo">
        <img src={logo} alt="Cognition logo" className="logo" />
        <a href="/" className="logo-link"><span className="logo-name">Cognition</span></a>
      </div>
      <button 
        onClick={handleButtonClick} 
        className="enter-btn"
        aria-label={username ? "В рабочее пространство" : "Войти"}
      >
        {username || "Войти"}
      </button>
    </header>
  );
};

export default Heads;
