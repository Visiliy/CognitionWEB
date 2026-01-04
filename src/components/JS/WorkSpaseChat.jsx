import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../UX/WorkSpaseChat.css";
import WorkSpaseOptions from "./WorkSpaseOptions";

const COOKIE_NAME = "user_session_id";
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
          const newExpirationTime = Date.now() + (COOKIE_DURATION_AUTHED * 1000);
          localStorage.setItem('cookie_expiration_time', newExpirationTime.toString());
        }
      }
    }
  }
};

const clearAllCookies = () => {
  const cookies = ["user_session_id", "is_registered", "access_token", "refresh_token", "username"];
  cookies.forEach(cookie => {
    deleteCookie(cookie);
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
  });
};

const WorkSpaseChat = () => {
  const navigate = useNavigate();
  const [openOptions, setOpenOptions] = useState(false);
  const [loader, setLoader] = useState(false);
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [addFilesToStorage, setAddFilesToStorage] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useMultiAgentMode, setUseMultiAgentMode] = useState(false);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [sharedStorageFiles, setSharedStorageFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Проверяем истечение куки перед загрузкой
    checkCookieExpiration();
    
    const storedId = getCookie(COOKIE_NAME);
    if (storedId) {
      setSessionId(storedId);
      setIsRegistered(true);
      setCookie(COOKIE_NAME, storedId, COOKIE_DURATION_AUTHED);
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
    }
    
    // Устанавливаем периодическую проверку истечения куки (каждые 5 минут)
    const expirationCheckInterval = setInterval(() => {
      checkCookieExpiration();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(expirationCheckInterval);
  }, []);

  const fetchFiles = async (storageType) => {
    if (!sessionId) return [];
    
    const response = await fetch(`http://127.0.0.1:5070/main_router/files?storage_type=${storageType}&session_id=${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${storageType} files`);
    }
    return await response.json();
  };

  const refreshFiles = async () => {
    if (!sessionId || !isRegistered) return;

    setLoadingFiles(true);
    setError(null);

    try {
      const [privateRes, sharedRes] = await Promise.all([
        fetchFiles("private"),
        fetchFiles("shared_storage")
      ]);

      setPrivateFiles(privateRes);
      setSharedStorageFiles(sharedRes);
    } catch (err) {
      setError("Ошибка загрузки файлов");
      console.error("Load error:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles(prev => {
      const total = [...prev, ...Array.from(newFiles)];
      return total;
    });
  };

  const deleteFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAccount = async () => {
    console.log('deleteAccount вызвана, sessionId:', sessionId);
    
    try {
      if (sessionId) {
        const response = await fetch('http://127.0.0.1:5070/main_router/delete_account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        
        if (!response.ok) {
          console.warn('Запрос на удаление аккаунта не успешен:', response.status);
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
    } finally {
      // Всегда удаляем куки и делаем редирект, даже если запрос не успешен
      clearAllCookies();
      navigate("/");
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || (!text.trim() && selectedFiles.length === 0)) return;

    setLoader(true);
    setOpenOptions(false);
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

      if (!isRegistered && response.status === 200) {
        setIsRegistered(true);
        setCookie(COOKIE_NAME, sessionId, COOKIE_DURATION_AUTHED);
      }
      
      await refreshFiles();
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    const observer = new ResizeObserver(adjustHeight);
    observer.observe(textarea);
    adjustHeight();

    return () => observer.disconnect();
  }, [text]);

  const openWindowsFunctions = () => {
    setOpenOptions(!openOptions);
  };

  const toggleAddFilesToStorage = () => {
    setAddFilesToStorage(!addFilesToStorage);
  };

  const toggleUseWebSearch = () => {
    setUseWebSearch(!useWebSearch);
  };

  const toggleUseMultiAgentMode = () => {
    setUseMultiAgentMode(!useMultiAgentMode);
  };

  return (
    <div className="work-space-chat-wrapper">
      {loader && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      {openOptions && (
        <WorkSpaseOptions
          onFilesSelected={handleFilesSelected}
          onToggleAddFilesToStorage={toggleAddFilesToStorage}
          onToggleUseWebSearch={toggleUseWebSearch}
          onToggleUseMultiAgentMode={toggleUseMultiAgentMode}
          onDeleteAccount={deleteAccount}
          isRegistered={isRegistered}
          addFilesToStorage={addFilesToStorage}
          useWebSearch={useWebSearch}
          useMultiAgentMode={useMultiAgentMode}
        />
      )}
      <div className="work-space-chat">
        <div>
          <textarea
            className="work-space-input"
            placeholder="Задайте любой вопрос..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            ref={textareaRef}
            value={text}
            disabled={loader}
          />
          <button 
            className="options-btn" 
            onClick={openWindowsFunctions}
            disabled={loader}
          >
            {openOptions ? "x" : "+"}
          </button>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview-item" onClick={() => !loader && deleteFile(index)}>
              {file.name}
            </div>
          ))}
          <button 
            className="send-btn" 
            onClick={handleSubmit}
            disabled={loader || (!text.trim() && selectedFiles.length === 0)}
          >
            {loader ? <div className="button-loader"></div> : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkSpaseChat;