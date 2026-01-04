import { useState } from "react";
import "../UX/EnterForm.css";

const COOKIE_NAME = "user_session_id";
const COOKIE_REGISTERED = "is_registered";
const COOKIE_DURATION_AUTHED = 30 * 24 * 60 * 60;

const setCookie = (name, value, maxAge) => {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const EnterForm = () => {
    const [openRegForm, setOpenRegForm] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim()) {
            setError("Username and password are required");
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
                    setError("User not found");
                } else if (data.error === "incorrect_password") {
                    setError("Incorrect password");
                } else {
                    setError(data.error || "Login failed");
                }
                return;
            }

            if (data.session_id) {
                setCookie(COOKIE_NAME, data.session_id, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_REGISTERED, data.is_registered === true ? "true" : "false", COOKIE_DURATION_AUTHED);
            }

            window.location.href = "/";
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim() || !email.trim()) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5070/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "username_already_taken") {
                    setError("Username already taken");
                } else if (data.error === "email_already_taken") {
                    setError("Email already taken");
                } else {
                    setError(data.error || "Registration failed");
                }
                return;
            }

            if (data.session_id) {
                setCookie(COOKIE_NAME, data.session_id, COOKIE_DURATION_AUTHED);
                setCookie(COOKIE_REGISTERED, data.is_registered === true ? "true" : "false", COOKIE_DURATION_AUTHED);
            }

            alert("Registration successful!");
            setOpenRegForm(true);
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enter-wrapper">
            {error && <div className="error-message">{error}</div>}
            {openRegForm ? (
                <form onSubmit={handleLogin}>
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
                <form onSubmit={handleRegister}>
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