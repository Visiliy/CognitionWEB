import { useRef, useState } from "react";
import "../UX/Options.css";

const Options = ({
  onFilesSelected,
  onToggleAddFilesToStorage,
  onToggleUseWebSearch,
  onToggleUseMultiAgentMode,
  addFilesToStorage,
  useWebSearch,
}) => {
  const fileInputRef = useRef(null);
  const [openAddFiles, setOpenFiles] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const toggleAddFiles = () => {
    setOpenFiles(!openAddFiles);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
    event.target.value = '';
  };

  return (
    <div className="options-wrapper">
      <ul className="ul-wrapper">
        <li className="li">
          <p className="upload-file" onClick={openFilePicker}>Добавить файл</p>
          <p className="to-right" onClick={toggleAddFiles}>→</p>
        </li>
        <li className="li li2" onClick={onToggleUseMultiAgentMode}>Мультиагентный режим</li>
      </ul>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
        accept=".txt,.md,.csv,.json,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.sh,.bat,.log,.doc"
      />
      {openAddFiles && (
        <div className="add-file">
          <p
            className="add-file-p"
            onClick={() => {
              onToggleAddFilesToStorage();
              setOpenFiles(false);
            }}
          >
            {addFilesToStorage
              ? "Файлы добавляются в общее хранилище"
              : "Добавлять файлы в общее хранилище"}
          </p>
          <p
            className="add-file-p"
            onClick={() => {
              onToggleUseWebSearch();
              setOpenFiles(false);
            }}
          >
            {useWebSearch
              ? "Web-поиск включён"
              : "Включить web-поиск"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Options;