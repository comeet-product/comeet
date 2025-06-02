"use client";
import { useState, useEffect } from "react";

export default function Title({ children }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

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

    return (
        <div className="relative flex justify-center items-center">
            <h1 className="text-2xl font-bold text-black">{children}</h1>
            <div className="relative ml-2">
                <img
                    src="/link-icon.svg"
                    alt="링크 복사"
                    className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={handleCopyUrl}
                />
                {showToast && (
                    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
