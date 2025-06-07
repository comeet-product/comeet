"use client";
import React, { useState, useRef } from "react";

export default function Title({ children, editable = true, onChange = () => {} }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputWidth, setInputWidth] = useState("auto");
    const [containerWidth, setContainerWidth] = useState(400); // 기본값
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef(null);
    const measureRef = useRef(null);

    // 클라이언트에서만 실제 너비 계산
    const calculateContainerWidth = () => {
        if (typeof window === 'undefined') return 400;
        
        const screenWidth = window.innerWidth;
        const isDesktop = screenWidth >= 1024; // lg breakpoint
        
        let containerWidth;
        if (isDesktop) {
            // 데스크톱: 화면의 25% 폭
            containerWidth = screenWidth * 0.25;
        } else {
            // 모바일: 전체 화면 폭
            containerWidth = screenWidth;
        }
        
        // 좌우 패딩 적용 (기존 80px에서 120px로 증가)
        const sidePadding = 120;
        const availableWidth = containerWidth - sidePadding;
        
        // 최소 200px, 최대 600px로 제한
        return Math.max(200, Math.min(availableWidth, 600));
    };

    // 클라이언트 마운트 후 실제 너비 계산
    React.useEffect(() => {
        setIsMounted(true);
        setContainerWidth(calculateContainerWidth());
    }, []);

    const handleEditClick = () => {
        if (!editable) return; // 편집 불가능하면 아무것도 하지 않음
        
        setIsEditing(true);
        if (children === "새로운 회의" || children === "제목을 입력하세요") {
            setInputValue("");
        } else {
            setInputValue(children);
        }
        setInputWidth(containerWidth + "px");
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
    };

    // 윈도우 리사이즈 핸들러 추가
    React.useEffect(() => {
        const handleResize = () => {
            const newWidth = calculateContainerWidth();
            setContainerWidth(newWidth);
            if (isEditing) {
                setInputWidth(newWidth + "px");
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isEditing]);

    const titleStyle = "text-2xl font-bold text-black text-center w-fit";

    return (
        <div className="relative flex justify-center items-center w-full max-w-full">
            {/* 텍스트 폭 측정을 위한 숨겨진 요소 */}
            <span
                ref={measureRef}
                className={`${titleStyle} absolute invisible whitespace-nowrap`}
                aria-hidden="true"
            />

            {isEditing ? (
                <div className="flex flex-col items-center w-full px-4">
                    <div 
                        className="relative overflow-hidden"
                        style={{
                            width: containerWidth + 'px',
                            maxWidth: containerWidth + 'px'
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInput}
                            onKeyDown={handleChange}
                            onBlur={handleBlur}
                            autoFocus
                            style={{ 
                                width: '100%',
                                boxSizing: 'border-box',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                            className={`${titleStyle} bg-transparent outline-none block text-center`}
                        />
                    </div>
                    {/* 반응형 underline */}
                    <div
                        className="h-0.5 bg-gray-400 mt-1 transition-all duration-200"
                        style={{
                            width: containerWidth + 'px',
                            maxWidth: containerWidth + 'px'
                        }}
                    />
                </div>
            ) : (
                <div className="relative flex justify-end items-center w-full">
                    {/* Title 컨테이너 - 절대 위치로 정확히 중앙에 배치 */}
                    <div 
                        className="absolute left-1/2 transform -translate-x-1/2 overflow-hidden"
                        style={{
                            width: containerWidth + 'px',
                            maxWidth: containerWidth + 'px'
                        }}
                    >
                        <h1 
                            className={`${titleStyle} cursor-default text-center`}
                            style={{ 
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: '1.2',
                                width: '100%'
                            }}
                        >
                            {children || "제목을 입력하세요"}
                        </h1>
                    </div>
                    
                    {/* 아이콘 - flex end로 오른쪽에 배치 */}
                    {editable && (
                        <button 
                            onClick={handleEditClick}
                            className="hover:opacity-70 transition-opacity z-10"
                            aria-label="제목 수정"
                        >
                            <img 
                                src="/editTitle.svg" 
                                alt="수정" 
                                width={17} 
                                height={17}
                            />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
