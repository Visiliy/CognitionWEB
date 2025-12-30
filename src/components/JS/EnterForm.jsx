import { useState } from "react";
import "../UX/EnterForm.css"

const EnterForm = () => {

    const [openRegForm, setOpenregForm] = useState(true);

    const openRegFormFunction = () => {
        setOpenregForm(!openRegForm);
    }

    return (
        <div className="enter-wrapper">
            {
                openRegForm ?
                <>
                    <p className="enter">Вход</p>
                    <input className="input" placeholder="Username" type="text" />
                    <input className="input" placeholder="Password" type="password"/>
                    <button className="enter-form-btn">Войти</button>
                    <div className="reg-div">
                        <p className="reg-text">Нет аккаунтв?</p>
                        <a className="reg-link" onClick={openRegFormFunction}>Зарегистрируйтесь</a>
                    </div>
                </> : 
                <>
                    <p className="enter">Регистрация</p>
                    <input className="input" placeholder="Username" type="text"/>
                    <input className="input" placeholder="Password" type="password"/>
                    <input className="input" placeholder="Email" type="email"/>
                    <button className="enter-form-btn">Зарегистрироваться</button>
                    <div className="reg-div">
                        <p className="reg-text">Есть аккаунт?</p>
                        <a className="reg-link" onClick={openRegFormFunction}>Войдите</a>
                    </div>
                </>
            }
        </div>
    );
}

export default EnterForm;