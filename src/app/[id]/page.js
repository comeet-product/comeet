"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { updateMeetingTitle } from "@/lib/supabase/updateMeeting";
import { getUsers } from "@/lib/supabase/getUsers";
import { getResults } from "@/lib/supabase/getResults";
import { calculateResults } from "@/lib/supabase/calculateResults";
import { calculateRecommendations } from "@/lib/supabase/calculateRecommendations";
import { getUserAvailability } from "@/lib/supabase/getUserAvailability";
import Title from "@/components/Title";
import TimetableResult from "@/components/TimetableComponent/TimetableResult";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";
import UserBar from "@/components/UserBar";
import Loading from "@/components/Loading";

export default function MeetingPage({ params }) {
    const [meeting, setMeeting] = useState(null);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserAvailability, setSelectedUserAvailability] =
        useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendationsRefreshKey, setRecommendationsRefreshKey] =
        useState(0);
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedCells, setSelectedCells] = useState([]); // 연속된 시간대 선택을 위한 배열
    const [selectedRecommendation, setSelectedRecommendation] = useState(null); // 선택된 추천 정보
    const router = useRouter();
    const searchParams = useSearchParams();
    const unwrappedParams = use(params);

    // 결과 테이블 참조를 위한 ref
    const resultTableRef = useRef(null);

    // URL 쿼리 파라미터에서 자동 선택할 사용자와 스크롤 위치 가져오기
    const autoSelectUserId = searchParams.get("selectedUser");
    const scrollTo = searchParams.get("scrollTo");

    useEffect(() => {
        const fetchData = async () => {
            console.log('=== 페이지 데이터 로딩 시작 ===');
            setIsLoading(true); // 초기 로딩 시작
            
            try {
                // 미팅 정보 가져오기
                const meetingResult = await getMeeting(unwrappedParams.id);
                if (meetingResult.success) {
                    console.log('Meeting data loaded:', meetingResult.data);
                    console.log('=== Meeting selectable_time debug ===');
                    const selectableTime = meetingResult.data.selectable_time;
                    if (selectableTime) {
                        console.log("Raw selectable_time:", selectableTime);
                        console.log("Start time (minutes):", selectableTime.start);
                        console.log("End time (minutes):", selectableTime.end);
                        console.log(
                            "Start time (hours):",
                            selectableTime.start
                                ? `${Math.floor(
                                      selectableTime.start / 60
                                  )}:${String(selectableTime.start % 60).padStart(
                                      2,
                                      "0"
                                  )}`
                                : "undefined"
                        );
                        console.log(
                            "End time (hours):",
                            selectableTime.end
                                ? `${Math.floor(selectableTime.end / 60)}:${String(
                                      selectableTime.end % 60
                                  ).padStart(2, "0")}`
                                : "undefined"
                        );
                    }
                    console.log("===============================");
                    setMeeting(meetingResult.data);
                } else {
                    console.error("Failed to fetch meeting:", meetingResult.message);
                    return; // 미팅 정보가 없으면 더 이상 진행하지 않음
                }

                // 사용자 목록 가져오기
                const usersResult = await getUsers(unwrappedParams.id);
                if (usersResult.success) {
                    setUsers(usersResult.data.users);
                    console.log('Users loaded:', usersResult.data.users.length, 'users');
                    
                    // URL에서 autoSelectUserId가 있으면 해당 사용자 자동 선택
                    if (
                        autoSelectUserId &&
                        usersResult.data.users.some(
                            (user) => user.userid === autoSelectUserId
                        )
                    ) {
                        setSelectedUser(autoSelectUserId);
                        console.log("Auto-selected user:", autoSelectUserId);
                    }
                } else {
                    console.error("Failed to fetch users:", usersResult.message);
                }

                // 결과 데이터 가져오기 (계산하지 않고 기존 데이터만 가져오기)
                const resultsResult = await getResults(unwrappedParams.id);
                if (resultsResult.success) {
                    console.log('Results loaded from database:', resultsResult.data.results.length, 'results');
                    setResults(resultsResult.data.results);
                } else {
                    console.error("Failed to fetch results:", resultsResult.message);
                }
                
                console.log('=== 페이지 데이터 로딩 완료 ===');
            } catch (error) {
                console.error("페이지 데이터 로딩 오류:", error);
            } finally {
                setIsLoading(false); // 초기 로딩 종료
            }
        };

        fetchData();
    }, [unwrappedParams.id, autoSelectUserId]);

    // 자동 스크롤 처리
    useEffect(() => {
        if (
            scrollTo === "result" &&
            resultTableRef.current &&
            meeting &&
            users.length > 0
        ) {
            // 데이터가 모두 로드된 후 약간의 딜레이를 두고 스크롤
            const timer = setTimeout(() => {
                resultTableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                // URL에서 쿼리 파라미터 제거 (깔끔하게 하기 위해)
                const newUrl = `/${unwrappedParams.id}`;
                router.replace(newUrl, { shallow: true });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [scrollTo, meeting, users, unwrappedParams.id, router]);

    // 선택된 사용자의 availability 가져오기
    useEffect(() => {
        const fetchUserAvailability = async () => {
            if (selectedUser) {
                console.log(
                    "Fetching availability for selected user:",
                    selectedUser
                );
                const availabilityResult = await getUserAvailability(
                    selectedUser
                );
                if (availabilityResult.success) {
                    setSelectedUserAvailability(
                        availabilityResult.data.availability
                    );
                    console.log(
                        "Selected user availability:",
                        availabilityResult.data.availability
                    );
                } else {
                    console.error(
                        "Failed to fetch user availability:",
                        availabilityResult.message
                    );
                    setSelectedUserAvailability(null);
                }
            } else {
                setSelectedUserAvailability(null);
            }
        };

        fetchUserAvailability();
    }, [selectedUser]);

    const handleCalculateResults = async () => {
        setIsCalculating(true);
        setIsLoading(true); // 전체 로딩 시작
        try {
            const calcResult = await calculateResults(unwrappedParams.id);
            if (calcResult.success) {
                console.log("Results calculated successfully");

                // 새로운 결과 데이터 가져오기
                const resultsResult = await getResults(unwrappedParams.id);
                if (resultsResult.success) {
                    setResults(resultsResult.data.results);
                    console.log("Updated results:", resultsResult.data.results);
                }
            } else {
                console.error(
                    "Failed to calculate results:",
                    calcResult.message
                );
            }
        } catch (error) {
            console.error("Error calculating results:", error);
        } finally {
            setIsCalculating(false);
            setIsLoading(false); // 전체 로딩 종료
        }
    };

    // Recommendations 다시 계산하는 함수
    const handleRecalculateRecommendations = async () => {
        setIsLoading(true); // 전체 로딩 시작
        try {
            console.log("Recalculating recommendations...");
            const result = await calculateRecommendations(unwrappedParams.id);
            if (result.success) {
                console.log(
                    "Recommendations recalculated successfully:",
                    result.data
                );
                // 추천 데이터 새로고침
                setRecommendationsRefreshKey((prev) => prev + 1);
            } else {
                console.error(
                    "Failed to recalculate recommendations:",
                    result.message
                );
            }
        } catch (error) {
            console.error("Error recalculating recommendations:", error);
        } finally {
            setIsLoading(false); // 전체 로딩 종료
        }
    };

    const handleTitleChange = async (newTitle) => {
        const result = await updateMeetingTitle(unwrappedParams.id, newTitle);
        if (result.success) {
            setMeeting((prev) => ({ ...prev, title: newTitle }));
        } else {
            alert(result.message);
        }
    };

    const handleShowSelect = () => {
        if (selectedUser) {
            router.push(`/${unwrappedParams.id}/edit?userId=${selectedUser}`);
        } else {
            router.push(`/${unwrappedParams.id}/edit`);
        }
    };

    const handleUserSelect = (userId) => {
        console.log("User selected:", userId);
        setSelectedUser((prev) => (prev === userId ? null : userId));
        setSelectedCell(null); // 하이라이트 해제
        setSelectedCells([]); // 연속 셀 선택 해제
        setSelectedRecommendation(null); // 추천 선택 해제
    };

    const handleCellSelect = (cellData) => {
        console.log("Cell selected:", cellData);
        if (selectedUser === null) {
            setSelectedCell((prev) => {
                if (
                    prev &&
                    prev.date === cellData.date &&
                    prev.start_time === cellData.start_time
                ) {
                    return null;
                }
                return cellData;
            });
            // 단일 셀 선택 시 연속 셀 초기화
            setSelectedCells([]);
            setSelectedRecommendation(null); // 추천 선택 해제
        }
    };

    // 추천 시간 클릭 핸들러
    const handleRecommendationClick = (recommendation) => {
        console.log("Recommendation clicked:", recommendation);

        // 사용자 선택 해제
        setSelectedUser(null);
        setSelectedCell(null);
        
        // 현재 선택된 추천과 같은지 확인 (토글 기능)
        const isCurrentlySelected = selectedRecommendation && 
            selectedRecommendation.date === recommendation.date && 
            selectedRecommendation.start_time === recommendation.start_time;
        
        if (isCurrentlySelected) {
            // 이미 선택된 추천을 다시 클릭하면 선택 해제
            console.log('Deselecting current recommendation');
            setSelectedCells([]);
            setSelectedRecommendation(null);
            return;
        }
        
        // 새로운 추천 선택
        setSelectedRecommendation(recommendation);
        
        // 연속된 시간대 계산
        const { date, start_time, duration } = recommendation;
        const selectedCellsArray = [];

        for (let i = 0; i < duration; i++) {
            // 시작 시간에서 i * 30분씩 더한 시간 계산
            const startTimeNum =
                typeof start_time === "string"
                    ? parseInt(start_time.replace(":", ""))
                    : start_time;
            const startHour = Math.floor(startTimeNum / 100);
            const startMinute = startTimeNum % 100;

            const totalMinutes = startHour * 60 + startMinute + i * 30;
            const newHour = Math.floor(totalMinutes / 60);
            const newMinute = totalMinutes % 60;
            const newTime = newHour * 100 + newMinute;

            // 해당 시간대의 실제 결과 데이터에서 참여자 수 찾기
            const correspondingResult = results.find(result => 
                result.date === date && result.start_time === newTime
            );
            
            const participantCount = correspondingResult ? correspondingResult.number : 0;
            console.log(`Time slot ${newTime}: found ${participantCount} participants`);

            selectedCellsArray.push({
                date: date,
                start_time: newTime,
                duration: 1,
                number: participantCount, // 실제 참여자 수 설정
            });
        }

        console.log("Selected cells array with participant counts:", selectedCellsArray);
        setSelectedCells(selectedCellsArray);

        // 결과 테이블로 스크롤
        if (resultTableRef.current) {
            resultTableRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    // 새 사용자가 추가되었을 때 목록 업데이트
    const handleUserAdded = async () => {
        setIsLoading(true); // 로딩 시작
        try {
            const usersResult = await getUsers(unwrappedParams.id);
            if (usersResult.success) {
                setUsers(usersResult.data.users);
            }

            // 결과 데이터 가져오기 (edit 페이지에서 이미 계산됨)
            const resultsResult = await getResults(unwrappedParams.id);
            if (resultsResult.success) {
                setResults(resultsResult.data.results);
            }

            // 추천 데이터 새로고침을 위해 refreshKey 업데이트
            setRecommendationsRefreshKey((prev) => prev + 1);
        } catch (error) {
            console.error("사용자 추가 후 데이터 업데이트 오류:", error);
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    if (!meeting) {
        return (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
                <Loading message="정보를 불러오고 있습니다..." />
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                <Loading message="데이터를 처리하고 있습니다..." />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1">
                <div className="px-10 py-8 flex flex-col gap-6 pb-24">
                    <Title onChange={handleTitleChange}>{meeting.title}</Title>
                    <AvailableDatesGroup 
                        meetingId={unwrappedParams.id}
                        refreshKey={recommendationsRefreshKey}
                        onRecommendationClick={handleRecommendationClick}
                        selectedRecommendation={selectedRecommendation}
                    />
                    
                    <div className="my-5" ref={resultTableRef}>
                        <TimetableResult 
                            dayCount={7}
                            halfCount={8}
                            startDate="05/19"
                            startTime={10}
                            dateHeaderHeight={23}
                            meetingId={unwrappedParams.id}
                            meeting={meeting}
                            results={results}
                            users={users}
                            selectedUser={selectedUser}
                            selectedUserAvailability={selectedUserAvailability}
                            selectedCell={selectedCell}
                            selectedCells={selectedCells}
                            onCellSelect={handleCellSelect}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 bg-white border-t border-gray-200">
                <UserBar 
                    meetingId={unwrappedParams.id} 
                    users={users}
                    selectedUser={selectedUser}
                    selectedCell={selectedCell}
                    selectedCells={selectedCells}
                    selectedRecommendationMembers={selectedRecommendation?.members || null}
                    onUserSelect={handleUserSelect}
                    onShowSelect={handleShowSelect}
                    onUserAdded={handleUserAdded}
                />
            </div>
        </div>
    );
}
