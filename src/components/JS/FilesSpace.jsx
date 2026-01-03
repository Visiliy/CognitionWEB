import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../UX/FilesSpace.css";

const COOKIE_NAME = "user_session_id";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const FilesSpace = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [sharedStorageFiles, setSharedStorageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedId = getCookie(COOKIE_NAME);
    if (!storedId) {
      navigate("/");
      return;
    }

    setSessionId(storedId);

    const checkRegistration = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5070/main_router/check_session?session_id=${storedId}`);
        const data = await res.json();
        if (!data.exists || !data.is_registered) {
          setIsRegistered(false);
          navigate("/");
          return;
        }
        setIsRegistered(true);
      } catch (err) {
        console.error("Failed to check session", err);
        navigate("/");
      }
    };

    checkRegistration();
  }, [navigate]);

  const fetchFiles = async (type) => {
    try {
      const endpoint = type === "private" ? "list_private_files" : "list_shared_storage_files";
      const res = await fetch(`http://127.0.0.1:5070/main_router/${endpoint}?session_id=${sessionId}`);
      if (!res.ok) throw new Error(`Failed to load ${type} files`);
      const data = await res.json();
      return data.files || [];
    } catch (err) {
      console.warn(`Error loading ${type} files:`, err.message);
      return [];
    }
  };

  const refreshFiles = async () => {
    if (!sessionId || !isRegistered) return;
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  const deleteSession = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5070/main_router/delete_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      if (response.ok) {
        deleteCookie(COOKIE_NAME);
        navigate("/");
      }
    } catch (error) {
      console.error('Ошибка при удалении сессии:', error);
    }
  };

  useEffect(() => {
    if (sessionId && isRegistered) {
      refreshFiles();
    }
  }, [sessionId, isRegistered]);

  if (loading) {
    return (
      <div className="files-space-wrapper">
        <style>{`
          .loader {
            width: 40px;
            height: 40px;
            border: 4px dotted #fff;
            border-radius: 50%;
            animation: rotate 3s linear infinite;
            margin: 0 auto;
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="files-space-wrapper">
        <p className="error">Ошибка загрузки файлов</p>
        <button onClick={refreshFiles} className="retry-btn">Повторить</button>
      </div>
    );
  }

  const hasFiles = privateFiles.length > 0 || sharedStorageFiles.length > 0;

  return (
    <div className="files-space-wrapper">
      <div className="files-header">
        <h1>Мои файлы</h1>
        <button onClick={refreshFiles} className="refresh-btn">Обновить</button>
        <button onClick={deleteSession} className="delete-session-btn">Удалить сессию</button>
      </div>
      
      {!hasFiles ? (
        <p className="empty-message">Пусто</p>
      ) : (
        <>
          {sharedStorageFiles.length > 0 && (
            <div className="files-section">
              <h2>Общее хранилище</h2>
              <ul className="files-list">
                {sharedStorageFiles.map((file, idx) => (
                  <li key={`shared-${idx}`} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {privateFiles.length > 0 && (
            <div className="files-section">
              <h2>Временное хранилище</h2>
              <ul className="files-list">
                {privateFiles.map((file, idx) => (
                  <li key={`private-${idx}`} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilesSpace;