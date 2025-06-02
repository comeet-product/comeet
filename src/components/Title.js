"use client";
import { useState, useEffect } from "react";

export default function Title({ children, dynamicTitle, dynamicLink }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const handleCopyUrl = async () => {
        try {
            const textToCopy = `[COMEET]\n${dynamicTitle}\n${dynamicLink}`;
            await navigator.clipboard.writeText(textToCopy);
            setToastMessage("링크가 복사되었습니다.");
            setShowToast(true);
            setIsVisible(true);
        } catch (err) {
            // 복사 실패 시 아무것도 표시하지 않음
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
            {children}
            <div className="relative ml-2">
                <img
                    src="/link-icon.svg"
                    alt="link-icon"
                    className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={handleCopyUrl}
                />

                {/* Toast */}
                {showToast && (
                    <div
                        className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500 ${
                            isVisible ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
