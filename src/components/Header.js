"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { deleteUser } from "@/lib/supabase/deleteUser";
import { getUser } from "@/lib/supabase/getUsers";
import { calculateResults } from "@/lib/supabase/calculateResults";
import { calculateRecommendations } from "@/lib/supabase/calculateRecommendations";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [currentUrl, setCurrentUrl] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [title, setTitle] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    // 현재 미팅의 title 가져오기
    useEffect(() => {
        const fetchMeetingTitle = async () => {
            // pathname에서 meetingId 추출 (/, /create가 아닌 경우)
            if (pathname !== "/" && pathname !== "/create") {
                const pathSegments = pathname.split("/");
                if (pathSegments.length >= 2 && pathSegments[1]) {
                    const meetingId = pathSegments[1];
                    try {
                        const meetingResult = await getMeeting(meetingId);
                        if (meetingResult.success) {
                            setTitle(meetingResult.data.title || "");
                        }
                    } catch (error) {
                        console.error("Failed to fetch meeting title:", error);
                    }
                }
            } else {
                setTitle(""); // 메인 페이지나 생성 페이지에서는 title 초기화
            }
        };

        fetchMeetingTitle();
    }, [pathname]);

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
            let shareUrl = "https://www.comeet.team";
            // /, /create는 무조건 메인 주소 복사
            if (!(pathname === "/" || pathname === "/create")) {
                const pathSegments = pathname.split("/");
                if (pathSegments.length === 2 && pathSegments[1]) {
                    shareUrl = `https://www.comeet.team/${pathSegments[1]}`;
                }
            }
            
            // title이 있으면 포함, 없으면 제외
            const textToCopy = title 
                ? `[Comeet]\n지금 바로 모두가 되는 일정을 확인해보세요!\n\n${title}\n${shareUrl}`
                : `[Comeet]\n지금 바로 모두가 되는 일정을 확인해보세요!\n$www.comeet.team`;
                
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setToastMessage("링크가 복사되었습니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
        } catch (err) {
            setToastMessage("링크 복사에 실패했습니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
        }
    };

    const handleDeleteClick = async () => {
        if (!userId) {
            alert(
                "삭제할 사용자 정보를 찾을 수 없습니다.\n편집 모드에서만 삭제가 가능합니다."
            );
            return;
        }

        if (isDeleting) {
            return; // 이미 삭제 진행 중
        }

        try {
            // 사용자 정보 먼저 가져오기 (이름 확인용)
            const userResult = await getUser(userId);
            const userName = userResult.success
                ? userResult.data.name
                : "사용자";

            const confirmMessage = `정말로 ${userName}님을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
            if (!confirm(confirmMessage)) {
                return;
            }

            setIsDeleting(true);

            const result = await deleteUser(userId);

            if (result.success) {
                console.log(
                    "User deleted successfully, now calculating results and recommendations..."
                );

                // 미팅 ID 추출
                const pathSegments = pathname.split("/");
                const meetingId = pathSegments[1];

                // 삭제 후 결과 및 추천 다시 계산
                try {
                    // 결과 계산
                    const calculateResult = await calculateResults(meetingId);
                    if (calculateResult.success) {
                        console.log(
                            "Results calculated successfully after user deletion"
                        );
                    } else {
                        console.error(
                            "Failed to calculate results after user deletion:",
                            calculateResult.message
                        );
                    }

                    // 추천 계산
                    const recResult = await calculateRecommendations(meetingId);
                    if (recResult.success) {
                        console.log(
                            "Recommendations calculated successfully after user deletion"
                        );
                    } else {
                        console.error(
                            "Failed to calculate recommendations after user deletion:",
                            recResult.message
                        );
                    }
                } catch (calcError) {
                    console.error(
                        "Error calculating results/recommendations after user deletion:",
                        calcError
                    );
                }

                setToastMessage(result.message);
                setShowToast(true);

                setTimeout(() => {
                    setShowToast(false);
                    // 메인 페이지로 돌아가기
                    router.push(`/${meetingId}`);
                }, 1500);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("삭제 중 오류:", error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setIsDeleting(false);
        }
    };

    // edit 화면인지 확인
    const isEditPage = pathname.includes("/edit");
    const userId = searchParams.get("userId");
    const isEditingExistingUser = isEditPage && userId;

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

            {/* 오른쪽 아이콘 - 기존 사용자 편집시에는 삭제, 나머지는 공유 */}
            <div className="relative">
                {isEditingExistingUser ? (
                    <img
                        src="/trash.png"
                        className={`w-6 h-6 object-contain cursor-pointer hover:opacity-70 transition-opacity ${
                            isDeleting ? "opacity-50" : ""
                        }`}
                        alt="삭제"
                        onClick={handleDeleteClick}
                        style={{ pointerEvents: isDeleting ? "none" : "auto" }}
                    />
                ) : (
                    <img
                        src="/share_icon.png"
                        className="w-6 h-6 object-contain cursor-pointer hover:opacity-70 transition-opacity"
                        alt="공유"
                        onClick={handleShareClick}
                    />
                )}

                {/* 토스트 메시지 */}
                {showToast && (
                    <div className="fixed bottom-[110px] left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
