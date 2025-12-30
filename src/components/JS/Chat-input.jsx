import { useState, useRef, useEffect } from "react";
import "../UX/Chat-input.css";
import Options from "./Options";

const ChatInput = () => {
  const [openOptions, setOpenOptions] = useState(false);
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const textareaRef = useRef(null);

  const handleFilesSelected = (newFiles) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const deleteFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };  

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5070/main_router/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });
      const result = await response.json();
      console.log('Ответ от Flask:', result);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    }
  };


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

  const openOptionsFunction = () => {
    setOpenOptions(!openOptions);
  };

  return (
    <>
      <div className="chat-wrapper">
        <h1 className="main-h1">Cognition</h1>
        <h2 className="main-h2">Точность и информативность превыше всего</h2>
        <div className="chat">
          <textarea
            placeholder="Задайте любой вопрос..."
            className="chat-input"
            onChange={(e) => setText(e.target.value)}
            ref={textareaRef}
            value={text}
          />
          <button className="options-btn" onClick={openOptionsFunction}>
            {
                openOptions ? <>x</> : <>+</>
            }
          </button>
          <button onClick={handleSubmit} className="send-btn">↑</button>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview-item" onClick={() => deleteFile(index)}>
                {file.name}
            </div>
          ))}
          {openOptions && <Options onFilesSelected={handleFilesSelected} />}
        </div>
      </div>
    </>
  );
};

export default ChatInput;
