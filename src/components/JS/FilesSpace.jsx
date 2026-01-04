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

const clearAllCookies = () => {
  const cookies = ["user_session_id", "is_registered", "access_token", "refresh_token", "username"];
  cookies.forEach(cookie => {
    deleteCookie(cookie);
    // Также удаляем с разными путями на всякий случай
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
  });
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

const FilesSpace = () => {
  //deleteCookie(COOKIE_NAME);

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
    setIsRegistered(true);
  }, [navigate]);

  const fetchFiles = async (type) => {
    if (!sessionId) return [];

    try {
      const endpoint = type === "private" ? "upload_private_files" : "upload_storage_files";
      const res = await fetch(`http://127.0.0.1:5070/main_router/${endpoint}?session_id=${sessionId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0 && data[0].FilesNames && Array.isArray(data[0].FilesNames)) {
        return data[0].FilesNames.map(name => ({ name }));
      }

      return [];
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
    if (!sessionId) return;

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);

      const response = await fetch("http://127.0.0.1:5070/main_router/delete_session", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        clearAllCookies();
        navigate("/");
      } else {
        throw new Error("Failed to delete session");
      }
    } catch (error) {
      console.error("Ошибка при удалении сессии:", error);
      setError("Ошибка при удалении сессии");
    }
  };

  useEffect(() => {
    if (sessionId && isRegistered) {
      refreshFiles();
    }
  }, [sessionId, isRegistered]);

  if (!isRegistered) return null;

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
        <p className="error">{error}</p>
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
              <h2 className="main-work-space-text">Общее хранилище</h2>
              <ul className="files-list">
                {sharedStorageFiles.map((file, idx) => (
                  <li key={`shared-${idx}`} className="file-item">
                    <span className="file-name">{truncateFileName(file.name)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {privateFiles.length > 0 && (
            <div className="files-section">
              <h2 className="main-work-space-text">Временное хранилище</h2>
              <ul className="files-list">
                {privateFiles.map((file, idx) => (
                  <li key={`private-${idx}`} className="file-item">
                    <span className="file-name">{truncateFileName(file.name)}</span>
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