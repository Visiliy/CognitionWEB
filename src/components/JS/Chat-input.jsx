import { useState } from "react";
import "../UX/Chat-input.css"
import Options from "./Options";

const ChatInput = () => {

    const [openOptions, setOpenOptions] = useState(true);

    const openOptionsFunction = () => {
        setOpenOptions(!openOptions);
    }

    return (
        <div className="chat-wrapper">
            <h1 className="main-h1">Cognition</h1>
            <h2 className="main-h2">Точность и информативность превыше всего</h2>
            <div className="chat">
                <textarea placeholder="Задай любой вопрос..." className="chat-input"/>
                <button className="options-btn" onClick={openOptionsFunction}>+</button>
                <button className="send-btn">↑</button>
                {openOptions && <Options />}
            </div>
        </div>
    );
}

export default ChatInput;