import "../UX/WorkSpaseOptions.css";

const WorkSpaseOptions = ({
  onFilesSelected,
  onToggleAddFilesToStorage,
  onToggleUseWebSearch,
  onToggleUseMultiAgentMode,
  onDeleteAccount,
  isRegistered,
  addFilesToStorage,
  useWebSearch,
  useMultiAgentMode
}) => {
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="work-spase-options">
      <ul>
        <li className="work-spase-options-li">
          <label style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
            Добавить файл
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        </li>
        <li 
          className="work-spase-options-li"
          onClick={onToggleUseMultiAgentMode}
          style={{ cursor: 'pointer' }}
        >
          Мультиагентный режим {useMultiAgentMode && '✓'}
        </li>
        <li 
          className="work-spase-options-li"
          onClick={onToggleUseWebSearch}
          style={{ cursor: 'pointer' }}
        >
          Включить web-поиск {useWebSearch && '✓'}
        </li>
        <li 
          className="work-spase-options-li"
          onClick={onToggleAddFilesToStorage}
          style={{ cursor: 'pointer' }}
        >
          Добавить файлы к общему хранилищу {addFilesToStorage && '✓'}
        </li>
        {isRegistered && (
          <li 
            className="work-spase-options-li"
            onClick={onDeleteAccount}
            style={{ cursor: 'pointer', color: '#ff4444' }}
          >
            Удалить аккаунт
          </li>
        )}
      </ul>
    </div>
  );
};

export default WorkSpaseOptions;