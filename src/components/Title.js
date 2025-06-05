"use client";
import { useState, useEffect, useRef } from "react";

export default function Title({ children, link = true, onChange = () => {} }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [currentUrl, setCurrentUrl] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [inputWidth, setInputWidth] = useState("auto");
    const inputRef = useRef(null);
    const measureRef = useRef(null);

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    // 텍스트 폭 측정 함수
    const measureTextWidth = (text) => {
        if (!measureRef.current) return "auto";
        measureRef.current.textContent = text || "제목을 입력하세요";
        const width = measureRef.current.offsetWidth;
        return Math.max(width + 20, 100) + "px"; // 최소 100px, 여유 공간 20px
    };

    const handleClick = () => {
        setIsEditing(true);
        if (children === "새로운 회의" || children === "제목을 입력하세요") {
            setInputValue("");
            setInputWidth(measureTextWidth(""));
        } else {
            setInputValue(children);
            setInputWidth(measureTextWidth(children));
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
        setInputWidth(measureTextWidth(e.target.value));
    };

    const titleStyle = "text-2xl font-bold text-black text-center w-fit";

    return (
        <div className="relative flex justify-center items-center gap-2">
            {/* 텍스트 폭 측정을 위한 숨겨진 요소 */}
            <span
                ref={measureRef}
                className={`${titleStyle} absolute invisible whitespace-nowrap`}
                aria-hidden="true"
            />

            {isEditing ? (
                <div className="flex flex-col items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInput}
                        onKeyDown={handleChange}
                        onBlur={handleBlur}
                        autoFocus
                        style={{ width: inputWidth }}
                        className={`${titleStyle} bg-transparent outline-none min-w-[100px]`}
                    />
                    {/* 반응형 underline */}
                    <div
                        style={{ width: inputWidth }}
                        className="h-0.5 bg-gray-400 mt-1 transition-all duration-200"
                    />
                </div>
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
                        <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                            {toastMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
