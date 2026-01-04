import { useState, useEffect } from "react";
import "../UX/EnterForm.css";

const COOKIE_NAME = "user_session_id";
const COOKIE_REGISTERED = "is_registered";
const COOKIE_ACCESS_TOKEN = "access_token";
const COOKIE_REFRESH_TOKEN = "refresh_token";
const COOKIE_USERNAME = "username";
const COOKIE_DURATION_AUTHED = 30 * 24 * 60 * 60;

const setCookie = (name, value, maxAge) => {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
  if (name === COOKIE_NAME) {
    const expirationTime = Date.now() + (maxAge * 1000);
    localStorage.setItem('cookie_session_id', value);
    localStorage.setItem('cookie_expiration_time', expirationTime.toString());
  }
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  if (name === COOKIE_NAME) {
    localStorage.removeItem('cookie_session_id');
    localStorage.removeItem('cookie_expiration_time');
  }
};

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
    localStorage.removeItem('cookie_session_id');
    localStorage.removeItem('cookie_expiration_time');
  }
};

const checkCookieExpiration = () => {
  const storedSessionId = localStorage.getItem('cookie_session_id');
  const expirationTime = localStorage.getItem('cookie_expiration_time');
  
  if (storedSessionId && expirationTime) {
    const currentTime = Date.now();
    const expiration = parseInt(expirationTime, 10);
    
    if (currentTime >= expiration) {
      const cookieExists = getCookie(COOKIE_NAME);
      
      if (!cookieExists) {
        handleExpiredCookie(storedSessionId);
      } else {
        const cookieValue = getCookie(COOKIE_NAME);
        if (cookieValue === storedSessionId) {
          const newExpirationTime = Date.now() + (COOKIE_DURATION_AUTHED * 1000);
          localStorage.setItem('cookie_expiration_time', newExpirationTime.toString());
        }
      }
    }
  }
};

const clearAllAuthCookies = () => {
  deleteCookie(COOKIE_NAME);
  deleteCookie(COOKIE_REGISTERED);
  deleteCookie(COOKIE_ACCESS_TOKEN);
  deleteCookie(COOKIE_REFRESH_TOKEN);
  deleteCookie(COOKIE_USERNAME);
};

const generateHashKey = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const EnterForm = ({ onLoginSuccess }) => {
    const [openRegForm, setOpenRegForm] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkCookieExpiration();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim()) {
            setError("Имя пользователя и пароль обязательны");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5070/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "user_not_found") {
                    setError("Пользователь не найден");
                } else if (data.error === "incorrect_password") {
                    setError("Неверный пароль");
                } else {
                    setError(data.error || "Ошибка входа");
                }
                return;
            }

            clearAllAuthCookies();

            if (data.access_token && data.refresh_token && data.session_id && data.user) {
                setCookie(COOKIE_ACCESS_TOKEN, data.access_token, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_REFRESH_TOKEN, data.refresh_token, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_NAME, data.session_id, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_REGISTERED, "true", COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_USERNAME, data.user.username, COOKIE_DURATION_AUTHED);
                
                setUsername("");
                setPassword("");
                setError("");
                
                if (onLoginSuccess) {
                    console.log('Вызываем onLoginSuccess с username:', data.user.username);
                    onLoginSuccess(data.user.username);
                } else {
                    console.log('onLoginSuccess не передан, перезагружаем страницу');
                    window.location.href = "/";
                }
            } else {
                setError("Ошибка: неполные данные от сервера");
            }
        } catch (err) {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim() || !email.trim()) {
            setError("Все поля обязательны для заполнения");
            return;
        }

        let session_id = getCookie(COOKIE_NAME);
        if (!session_id) {
            session_id = generateHashKey();
        }

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5070/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "username_already_taken") {
                    setError("Имя пользователя уже занято");
                } else if (data.error === "email_already_taken") {
                    setError("Email уже занят");
                } else {
                    setError(data.error || "Ошибка регистрации");
                }
                return;
            }

            if (data.status === "already_registered") {
                setError("Пользователь уже зарегистрирован");
                return;
            }

            if (data.status === "registered" && data.session_id) {
                clearAllAuthCookies();
                setCookie(COOKIE_NAME, data.session_id, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_REGISTERED, "true", COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_USERNAME, username, COOKIE_DURATION_AUTHED);
                
                const registeredUsername = username;
                setUsername("");
                setPassword("");
                setEmail("");
                setError("");
                
                if (onLoginSuccess) {
                    console.log('Вызываем onLoginSuccess с username:', registeredUsername);
                    onLoginSuccess(registeredUsername);
                } else {
                    console.log('onLoginSuccess не передан, перезагружаем страницу');
                    window.location.href = "/";
                }
            }
        } catch (err) {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enter-wrapper">
            {openRegForm ? (
                <form onSubmit={handleLogin} className="enter-form">
                    {error && <div className="error-message">{error}</div>}
                    <p className="enter">Вход</p>
                    <input
                        className="input"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        className="input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="enter-form-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Войти"}
                    </button>
                    <div className="reg-div">
                        <p className="reg-text">Нет аккаунта?</p>
                        <a
                            className="reg-link"
                            onClick={() => {
                                setOpenRegForm(false);
                                setError("");
                            }}
                        >
                            Зарегистрируйтесь
                        </a>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="enter-form">
                    {error && <div className="error-message">{error}</div>}
                    <p className="enter">Регистрация</p>
                    <input
                        className="input"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        className="input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        className="input"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="enter-form-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Зарегистрироваться"}
                    </button>
                    <div className="reg-div">
                        <p className="reg-text">Есть аккаунт?</p>
                        <a
                            className="reg-link"
                            onClick={() => {
                                setOpenRegForm(true);
                                setError("");
                            }}
                        >
                            Войдите
                        </a>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EnterForm;