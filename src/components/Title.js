"use client";
import { useToast, Toast } from "./Toast";

export default function Title({ children }) {
    const { isVisible, message, showToast } = useToast();

    const handleCopyUrl = async () => {
        try {
            const textToCopy = `[COMEET]\n${children}\n${window.location.href}`;
            await navigator.clipboard.writeText(textToCopy);
            showToast("링크가 복사되었습니다.");
        } catch (err) {
            showToast("링크 복사에 실패했습니다.");
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
                <Toast isVisible={isVisible} message={message} />
            </div>
        </div>
    );
}
