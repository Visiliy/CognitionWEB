import "../UX/Heads.css";
import logo from "../../assets/logo.jpeg";

const Heads = ({ openEnterWindow }) => {
  return (
    <header className="heads-wrapper" role="banner">
      <div className="heads-logo-wrapper" role="img" aria-label="Cognition logo">
        <img src={logo} alt="Cognition logo" className="logo" />
        <span className="logo-name">Cognition</span>
      </div>
      <button 
        onClick={openEnterWindow} 
        className="enter-btn"
        aria-label="В чат"
      >
        Войти
      </button>
    </header>
  );
};

export default Heads;
