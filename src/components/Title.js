"use client";
import { useState, useRef } from "react";

export default function Title({ children, editable = true, onChange = () => {} }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputWidth, setInputWidth] = useState("auto");
    const inputRef = useRef(null);
    const measureRef = useRef(null);

    // 텍스트 폭 측정 함수
    const measureTextWidth = (text) => {
        if (!measureRef.current) return "auto";
        measureRef.current.textContent = text || "제목을 입력하세요";
        const width = measureRef.current.offsetWidth;
        return Math.max(width + 20, 100) + "px"; // 최소 100px, 여유 공간 20px
    };

    const handleClick = () => {
        if (!editable) return; // 편집 불가능하면 아무것도 하지 않음
        
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



    const handleInput = (e) => {
        setInputValue(e.target.value);
        setInputWidth(measureTextWidth(e.target.value));
    };

    const titleStyle = "text-2xl font-bold text-black text-center w-fit";

    return (
        <div className="relative flex justify-center items-center">
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
                    className={`${titleStyle} ${editable ? 'cursor-text' : 'cursor-default'}`}
                    onClick={handleClick}
                >
                    {children || "제목을 입력하세요"}
                </h1>
            )}
        </div>
    );
}
