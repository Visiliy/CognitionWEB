import { useState, useEffect, useCallback } from 'react';
import ChatInput from './components/JS/Chat-input.jsx';
import Heads from './components/JS/Heads.jsx';
import EnterForm from './components/JS/EnterForm.jsx';
import Notification from './components/JS/Notification.jsx';

function App() {
  const [isEnterWindowOpen, setIsEnterWindowOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  const [addFilesToStorage, setAddFilesToStorage] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useMultiAgentMode, setMultiAgentMode] = useState(false);

  const toggleEnterWindow = () => {
    setIsEnterWindowOpen(prev => !prev);
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
      <Heads openEnterWindow={toggleEnterWindow} />
      {isEnterWindowOpen ? (
        <ChatInput
          onToggleAddFilesToStorage={toggleAddFilesToStorage}
          onToggleUseWebSearch={toggleUseWebSearch}
          onToggleUseMultiAgentMode={toggleUseMultiAgentMode}
          addFilesToStorage={addFilesToStorage}
          useWebSearch={useWebSearch}
          useMultiAgentMode={useMultiAgentMode}
        />
      ) : <EnterForm />}
      {isNotificationOpen && <Notification text={notificationText} />}
    </>
  );
}

export default App;