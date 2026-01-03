import { useRef, useState, useEffect } from "react";
import "../UX/WorkSpaseChat.css"

const WorkSpaseChat = () => {

    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
    
        const adjustHeight = () => {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        };
    
        textarea.addEventListener("input", adjustHeight);
        return () => {
          textarea.removeEventListener("input", adjustHeight);
        };
      }, []);

    return (
        <div className="work-space-chat">
            <div>
                <textarea 
                    className="work-space-input" 
                    placeholder="Задайте любой вопрос..."
                    onChange={(e) => setText(e.target.value)}
                    ref={textareaRef}
                    value={text}
                />
                <button className="options-btn">+</button>
                <button className="send-btn">↑</button>
            </div>
        </div>
    );
}

export default WorkSpaseChat;