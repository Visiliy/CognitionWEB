import "../UX/Chat-input.css"

const ChatInput = () => {
    return (
        <div className="chat-wrapper">
            <h1 className="main-h1">Cognition</h1>
            <h2 className="main-h2">Точность и информативность превыше всего</h2>
            <div className="chat">
                <textarea placeholder="Задай любой вопрос..." className="chat-input"/>
                <button className="options-btn">+</button>
                <button className="send=btn">↑</button>
            </div>
            
        </div>
    );
}

export default ChatInput;