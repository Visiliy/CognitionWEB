import { useState, useEffect, useCallback } from 'react';
import ChatInput from './components/JS/Chat-input.jsx';
import Heads from './components/JS/Heads.jsx';
import EnterForm from './components/JS/EnterForm.jsx';
import Notification from './components/JS/Notification.jsx';

const COOKIE_USERNAME = "username";
const COOKIE_REGISTERED = "is_registered";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

function App() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [username, setUsername] = useState(null);
  const [isEnterWindowOpen, setIsEnterWindowOpen] = useState(true);

  const [addFilesToStorage, setAddFilesToStorage] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useMultiAgentMode, setMultiAgentMode] = useState(false);

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

  const showNotification = useCallback((text) => {
    setNotificationText(text);
    setIsNotificationOpen(true);
    const timer = setTimeout(() => setIsNotificationOpen(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleAddFilesToStorage = () => {
    const next = !addFilesToStorage;
    setAddFilesToStorage(next);
    showNotification(next ? "Файлы добавлены к общему хранилищу" : "Файлы больше не добавляются к хранилищу");
  };

  const toggleUseWebSearch = () => {
    const next = !useWebSearch;
    setUseWebSearch(next);
    showNotification(next ? "Web-поиск активирован" : "Web-поиск деактивирован");
  };

  const toggleUseMultiAgentMode = () => {
    const next = !useMultiAgentMode;
    setMultiAgentMode(next);
    showNotification(next ? "Мультиагентный режим активирован" : "Мультиагентный режим деактивирован");
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
        <ChatInput
          onToggleAddFilesToStorage={toggleAddFilesToStorage}
          onToggleUseWebSearch={toggleUseWebSearch}
          onToggleUseMultiAgentMode={toggleUseMultiAgentMode}
          addFilesToStorage={addFilesToStorage}
          useWebSearch={useWebSearch}
          useMultiAgentMode={useMultiAgentMode}
        />
      ) : <EnterForm onLoginSuccess={handleLoginSuccess} />}
      {isNotificationOpen && <Notification text={notificationText} />}
    </>
  );
}

export default App;