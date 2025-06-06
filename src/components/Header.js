"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMeeting } from "@/lib/supabase/getMeeting";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [currentUrl, setCurrentUrl] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const handleLogoClick = () => {
        if (pathname === "/") {
            // 메인 페이지일 때는 새로고침
            window.location.reload();
        } else {
            // 다른 페이지일 때는 메인 페이지로 이동
            router.push("/");
        }
    };

    const handleShareClick = async () => {
        try {
            // URL에서 미팅 ID 추출
            const pathSegments = pathname.split('/');
            const meetingId = pathSegments[1]; // /[id] 형태에서 id 추출
            
            let shareUrl = currentUrl;
            
            if (meetingId && meetingId !== '') {
                // getMeeting을 사용해서 미팅 정보 확인
                const meetingResult = await getMeeting(meetingId);
                if (meetingResult.success) {
                    shareUrl = `www.comeet.team/${meetingId}`;
                }
            }
            
            const textToCopy = `[COMEET]\n지금 바로 모두가 되는 일정을 확인해보세요!\n${shareUrl}`;
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
        <div className="px-6 py-4 flex justify-between items-center relative">
            {/* 왼쪽 로고 */}
            <img
                src="/logo.png"
                className="w-6 h-6 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                alt="logo"
                onClick={handleLogoClick}
            />
            
            {/* 가운데 텍스트 로고 */}
            <img
                src="/logo_text_only.png"
                className="h-5 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                alt="comeet"
                onClick={handleLogoClick}
            />
            
            {/* 오른쪽 공유 아이콘 */}
            <div className="relative">
                <img
                    src="/share_icon.png"
                    className="w-6 h-6 object-contain cursor-pointer hover:opacity-70 transition-opacity"
                    alt="공유"
                    onClick={handleShareClick}
                />
                
                {/* 토스트 메시지 */}
                {showToast && (
                    <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
