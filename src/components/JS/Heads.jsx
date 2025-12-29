import "../UX/Heads.css"
import logo from "/src/assets/logo.jpg"

const Heads = () => {
    return (
        <div className="heads-wrapper">
            <div className="heads-logo-wrapper">
                <img src={logo} className="logo" />
            </div>
        </div>
    );
}

export default Heads;