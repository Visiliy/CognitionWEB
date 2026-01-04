import { useEffect } from "react";
import "../UX/FilePreviewModal.css";

const FilePreviewModal = ({ isOpen, fileName, content, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="file-preview-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="file-preview-header">
          <h3>{fileName}</h3>
          <button className="file-preview-close" onClick={onClose}>&times;</button>
        </div>
        <div className="file-preview-body">{content}</div>
      </div>
    </div>
  );
};

export default FilePreviewModal;