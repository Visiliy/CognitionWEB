import { useState, useRef, useEffect } from "react";
import "../UX/Chat-input.css";
import { useNavigate } from "react-router-dom";
import Options from "./Options";

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
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
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
        window.location.reload();
      }
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
    }
  };

  useEffect(() => {
    const storedId = getCookie(COOKIE_NAME);
    if (storedId) {
      setSessionId(storedId);
      setIsRegistered(true);
      setCookie(COOKIE_NAME, storedId, COOKIE_DURATION_AUTHED);
    } else {
      const newId = generateHashKey();
      setSessionId(newId);
      setIsRegistered(false);
      setCookie(COOKIE_NAME, newId, COOKIE_DURATION_ANON);
    }
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

      if (!isRegistered && response.status === 200) {
        setIsRegistered(true);
        setCookie(COOKIE_NAME, sessionId, COOKIE_DURATION_AUTHED);
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
              {file.name}
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