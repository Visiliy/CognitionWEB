import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App2.css";
import FilesSpace from "./components/JS/FilesSpace";
import Heads from "./components/JS/Heads";
import WorkSpaseChat from "./components/JS/WorkSpaseChat";
import EnterForm from "./components/JS/EnterForm";

const COOKIE_USERNAME = "username";
const COOKIE_REGISTERED = "is_registered";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const App2 = () => {
    const [username, setUsername] = useState(null);
    const [isEnterWindowOpen, setIsEnterWindowOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = getCookie(COOKIE_USERNAME);
        const isRegistered = getCookie(COOKIE_REGISTERED) === "true";
        if (storedUsername && isRegistered) {
            setUsername(storedUsername);
        }
    }, []);

    const toggleEnterWindow = () => {
        setIsEnterWindowOpen(prev => !prev);
    };

    const handleLoginSuccess = (userUsername) => {
        setUsername(userUsername);
        setIsEnterWindowOpen(true);
    };

    const handleUsernameClick = () => {
        if (!isEnterWindowOpen) {
            setIsEnterWindowOpen(true);
        }
    };

    const deleteAllCookies = () => {
        const cookies = document.cookie.split(";");
        
        cookies.forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/working_area;`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`;
            }
        });
    };

    const handleLogout = () => {
        deleteAllCookies();
        navigate("/");
    };

    return (
        <>
            <Heads 
                openEnterWindow={toggleEnterWindow} 
                username={username}
                onUsernameClick={handleUsernameClick}
                isEnterWindowOpen={isEnterWindowOpen}
            />
            <p className="enter-text" onClick={handleLogout}>Выйти из аккаунта</p>
            {isEnterWindowOpen ? (
                <div className="space">
                    <FilesSpace />
                    <WorkSpaseChat />
                </div>
            ) : (
                <EnterForm onLoginSuccess={handleLoginSuccess} />
            )}
        </>
    );
};

export default App2;