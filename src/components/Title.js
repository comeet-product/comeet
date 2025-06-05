"use client";
import { useState, useEffect, useRef } from "react";

export default function Title({ children, link = true, onChange = () => {} }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [currentUrl, setCurrentUrl] = useState("");
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const handleClick = () => {
        setIsEditing(true);
        if (children === "새로운 회의" || children === "제목을 입력하세요") {
            setInputValue("");
        } else {
            setInputValue(children);
        }
    };

    const handleSave = (value) => {
        setIsEditing(false);
        const trimmedValue = value.trim();
        const finalValue = trimmedValue || "제목을 입력하세요";
        onChange?.(finalValue);
    };

    const handleChange = (e) => {
        if (e.key === "Enter") {
            handleSave(e.target.value);
        }
    };

    const handleBlur = (e) => {
        handleSave(e.target.value);
    };

    const handleCopyUrl = async () => {
        try {
            const textToCopy = `[COMEET]\n${children}\n${currentUrl}`;
            await navigator.clipboard.writeText(textToCopy);
            setToastMessage("링크가 복사되었습니다.");
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
            }, 1500);
        } catch (err) {
            setToastMessage("링크 복사에 실패했습니다.");
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
            }, 1500);
        }
    };

    const handleInput = (e) => {
        setInputValue(e.target.value);
        e.target.setAttribute("size", Math.max(e.target.value.length, 1));
    };

    const titleStyle = "text-2xl font-bold text-black text-center w-fit";

    return (
        <div className="relative flex justify-center items-center gap-2">
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={handleChange}
                    onBlur={handleBlur}
                    autoFocus
                    size={Math.max(inputValue.length || 1, 1)}
                    className={`${titleStyle} bg-transparent outline-none`}
                />
            ) : (
                <h1
                    className={`${titleStyle} cursor-text`}
                    onClick={handleClick}
                >
                    {children || "제목을 입력하세요"}
                </h1>
            )}
            {link && !isEditing && (
                <div className="relative flex items-center justify-center">
                    <img
                        src="/link-icon.svg"
                        alt="링크 복사"
                        className="w-8 flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={handleCopyUrl}
                    />
                    {showToast && (
                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                            {toastMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
