'use client';
import { useState, useEffect } from 'react';

export default function Title({ children, onTitleChange }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(children || '새로운 회의');

  useEffect(() => {
    setTitle(children);
  }, [children]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage('링크가 복사되었습니다.');
      setShowToast(true);
      setIsVisible(true);
    } catch (err) {
      // 복사 실패 시 아무것도 표시하지 않음
    }
  };

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onTitleChange) {
        onTitleChange(title);
      }
    }
  };

  useEffect(() => {
    if (showToast) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 1250);
      
      const removeTimer = setTimeout(() => {
        setShowToast(false);
      }, 1500);
      
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showToast]);

  return (
    <div className="relative flex justify-center items-center">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleKeyDown}
          className="text-2xl font-bold text-black bg-transparent border-b-2 border-main outline-none px-2"
          autoFocus
        />
      ) : (
        <h1 
          className="text-2xl font-bold text-black cursor-pointer hover:opacity-80"
          onClick={handleTitleClick}
        >
          {title}
        </h1>
      )}
      <div className="relative ml-2">
        <img 
          src="/link-icon.svg" 
          alt="link-icon" 
          className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity" 
          onClick={handleCopyUrl}
        />
        
        {/* Toast */}
        {showToast && (
          <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}