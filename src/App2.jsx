import { useState, useEffect } from "react";
import "./App2.css"
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
        console.log('Успешный вход, username:', userUsername);
        setUsername(userUsername);
        setIsEnterWindowOpen(true);
    };

    const handleUsernameClick = () => {
        if (!isEnterWindowOpen) {
            setIsEnterWindowOpen(true);
        }
    };

    return (
        <>
            <Heads 
                openEnterWindow={toggleEnterWindow} 
                username={username}
                onUsernameClick={handleUsernameClick}
                isEnterWindowOpen={isEnterWindowOpen}
            />
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
}

export default App2;