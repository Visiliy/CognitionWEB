import { useRef, useState } from "react";
import "../UX/Options.css";

const Options = ({ onFilesSelected }) => {
  const fileInputRef = useRef(null);
  const [openAddFiles, setOpenFiles] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addFiles = () => {
    setOpenFiles(!openAddFiles);
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="options-wrapper">
      <ul className="ul-wrapper">
        <li className="li">
          <p className="upload-file" onClick={openFilePicker}>Добавить файл</p>
          <p className="to-right" onClick={addFiles}>→</p>
        </li>
        <li className="li li2">Мультиагентный режим</li>
      </ul>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
        accept=".txt,.md,.csv,.json,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.sh,.bat,.log"
      />
    {
        openAddFiles && <div className="add-file">
        <p className="add-file-p">Добавить файлы к общему хранилищу</p>
    </div>
    }
    </div>
  );
};

export default Options;
