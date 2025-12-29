import "../UX/Heads.css"
import logo from "/src/assets/logo.jpeg"

const Heads = () => {
    return (
        <div className="heads-wrapper">
            <div className="heads-logo-wrapper">
                <img src={logo} className="logo" />
                <span className="logo-name">Cognition</span>
            </div>
            <button className="enter-btn">Войти</button>
        </div>
    );
}

export default Heads;