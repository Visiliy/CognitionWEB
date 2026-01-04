import { useState, useRef, useEffect } from "react";
import "../UX/Chat-input.css";
import { useNavigate } from "react-router-dom";
import Options from "./Options";

const COOKIE_NAME = "user_session_id";
const COOKIE_REGISTERED = "is_registered";
const COOKIE_DURATION_AUTHED = 30 * 24 * 60 * 60;
const COOKIE_DURATION_ANON = 24 * 60 * 60;

const generateHashKey = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, maxAge) => {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
  // Сохраняем информацию о куке в localStorage для отслеживания истечения
  if (name === COOKIE_NAME) {
    const expirationTime = Date.now() + (maxAge * 1000);
    localStorage.setItem('cookie_session_id', value);
    localStorage.setItem('cookie_expiration_time', expirationTime.toString());
  }
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  if (name === COOKIE_NAME) {
    localStorage.removeItem('cookie_session_id');
    localStorage.removeItem('cookie_expiration_time');
  }
};

// Функция для отправки запроса на удаление сессии при истечении куки
const handleExpiredCookie = async (sessionId) => {
  if (!sessionId) return;
  
  try {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    
    const response = await fetch('http://127.0.0.1:5070/main_router/delete_session', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      console.log('Сессия удалена с сервера после истечения куки');
    } else {
      console.warn('Не удалось удалить сессию с сервера:', response.status);
    }
  } catch (error) {
    console.error('Ошибка при удалении сессии с сервера:', error);
  } finally {
    // Очищаем localStorage
    localStorage.removeItem('cookie_session_id');
    localStorage.removeItem('cookie_expiration_time');
  }
};

// Функция для проверки истечения куки
const checkCookieExpiration = () => {
  const storedSessionId = localStorage.getItem('cookie_session_id');
  const expirationTime = localStorage.getItem('cookie_expiration_time');
  
  if (storedSessionId && expirationTime) {
    const currentTime = Date.now();
    const expiration = parseInt(expirationTime, 10);
    
    // Проверяем, истекла ли кука
    if (currentTime >= expiration) {
      // Кука истекла, проверяем, существует ли она еще
      const cookieExists = getCookie(COOKIE_NAME);
      
      if (!cookieExists) {
        // Кука удалена браузером, отправляем запрос на сервер
        handleExpiredCookie(storedSessionId);
      } else {
        // Кука еще существует, но время истекло - обновляем localStorage
        const cookieValue = getCookie(COOKIE_NAME);
        if (cookieValue === storedSessionId) {
          // Обновляем время истечения, если кука была обновлена
          const isRegistered = getCookie(COOKIE_REGISTERED) === "true";
          const newMaxAge = isRegistered ? COOKIE_DURATION_AUTHED : COOKIE_DURATION_ANON;
          const newExpirationTime = Date.now() + (newMaxAge * 1000);
          localStorage.setItem('cookie_expiration_time', newExpirationTime.toString());
        }
      }
    }
  }
};

const truncateFileName = (fileName, maxLength = 40) => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // Нет расширения или точка в начале
    return fileName.substring(0, maxLength - 3) + '...';
  }

  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const availableLength = maxLength - 3 - extension.length;

  if (availableLength <= 0) {
    return '...' + extension;
  }

  return nameWithoutExt.substring(0, availableLength) + '...' + extension;
};

const ChatInput = ({
  onToggleAddFilesToStorage,
  onToggleUseWebSearch,
  onToggleUseMultiAgentMode,
  addFilesToStorage = false,
  useWebSearch = false,
  useMultiAgentMode = false,
}) => {
  const navigate = useNavigate();
  const [openOptions, setOpenOptions] = useState(false);
  const [loader, setLoader] = useState(false);
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const textareaRef = useRef(null);

  const deleteAccount = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch('http://127.0.0.1:5070/main_router/delete_account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (response.ok) {
        deleteCookie(COOKIE_NAME);
        deleteCookie(COOKIE_REGISTERED);
        window.location.reload();
      }
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
    }
  };

  useEffect(() => {
    // Проверяем истечение куки перед загрузкой
    checkCookieExpiration();
    
    const storedSessionId = getCookie(COOKIE_NAME);
    const storedRegistered = getCookie(COOKIE_REGISTERED) === "true";

    if (storedSessionId) {
      setSessionId(storedSessionId);
      setIsRegistered(storedRegistered);
      if (storedRegistered) {
        setCookie(COOKIE_NAME, storedSessionId, COOKIE_DURATION_AUTHED);
        setCookie(COOKIE_REGISTERED, "true", COOKIE_DURATION_AUTHED);
      } else {
        setCookie(COOKIE_NAME, storedSessionId, COOKIE_DURATION_ANON);
        setCookie(COOKIE_REGISTERED, "false", COOKIE_DURATION_ANON);
      }
    } else {
      // Проверяем, не истекла ли кука (есть в localStorage, но нет в cookies)
      const localStorageSessionId = localStorage.getItem('cookie_session_id');
      if (localStorageSessionId) {
        // Кука истекла, отправляем запрос на удаление сессии
        handleExpiredCookie(localStorageSessionId);
      }
      
      const newId = generateHashKey();
      setSessionId(newId);
      setIsRegistered(false);
      setCookie(COOKIE_NAME, newId, COOKIE_DURATION_ANON);
      setCookie(COOKIE_REGISTERED, "false", COOKIE_DURATION_ANON);
    }
    
    // Устанавливаем периодическую проверку истечения куки (каждые 5 минут)
    const expirationCheckInterval = setInterval(() => {
      checkCookieExpiration();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(expirationCheckInterval);
  }, []);

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles(prev => {
      const total = [...prev, ...Array.from(newFiles)];
      return total;
    });
  };

  const deleteFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!sessionId || (!text.trim() && selectedFiles.length === 0)) return;

    setLoader(true);
    const formData = new FormData();
    formData.append("text", text.trim());
    formData.append("add_files_to_storage", addFilesToStorage ? "true" : "false");
    formData.append("use_web_search", useWebSearch ? "true" : "false");
    formData.append("use_multi_agent_mode", useMultiAgentMode ? "true" : "false");
    formData.append("session_id", sessionId);
    formData.append("is_registered", isRegistered ? "true" : "false");

    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await fetch('http://127.0.0.1:5070/main_router/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setText("");
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      if (!isRegistered && result.session_id && result.is_registered === true) {
        setSessionId(result.session_id);
        setIsRegistered(true);
        setCookie(COOKIE_NAME, result.session_id, COOKIE_DURATION_AUTHED);
        setCookie(COOKIE_REGISTERED, "true", COOKIE_DURATION_AUTHED);
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    } finally {
      setLoader(false);
      navigate("/working_area");
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };

    const observer = new ResizeObserver(adjustHeight);
    observer.observe(textarea);
    adjustHeight();

    return () => observer.disconnect();
  }, []);

  const openOptionsFunction = () => {
    setOpenOptions(!openOptions);
  };

  return (
    <>
      <div className="chat-wrapper">
        {!loader ? (
          <>
            <h1 className="main-h1">Cognition</h1>
            <h2 className="main-h2">Точность и информативность превыше всего</h2>
          </>
        ) : (
          <div className="loader"></div>
        )}
        <div className="chat">
          <textarea
            placeholder="Задайте любой вопрос..."
            className="chat-input"
            onChange={(e) => setText(e.target.value)}
            ref={textareaRef}
            value={text}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button className="options-btn" onClick={openOptionsFunction}>
            {openOptions ? "x" : "+"}
          </button>
          <button onClick={handleSubmit} className="send-btn" disabled={loader || (!text.trim() && selectedFiles.length === 0)}>↑</button>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview-item" onClick={() => deleteFile(index)}>
              {truncateFileName(file.name)}
            </div>
          ))}
          {openOptions && (
            <Options
              onFilesSelected={handleFilesSelected}
              onToggleAddFilesToStorage={onToggleAddFilesToStorage}
              onToggleUseWebSearch={onToggleUseWebSearch}
              onToggleUseMultiAgentMode={onToggleUseMultiAgentMode}
              onDeleteAccount={deleteAccount}
              isRegistered={isRegistered}
              addFilesToStorage={addFilesToStorage}
              useWebSearch={useWebSearch}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatInput;