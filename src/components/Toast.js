"use client";
import { useState } from "react";

export const useToast = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("");

    const showToast = (msg) => {
        setMessage(msg);
        setIsVisible(true);

        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, 1500);

        return () => clearTimeout(hideTimer);
    };

    return { isVisible, message, showToast };
};

export const Toast = ({ isVisible, message }) => {
    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            {message}
        </div>
    );
}; 