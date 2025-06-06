"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { updateMeetingTitle } from "@/lib/supabase/updateMeeting";
import { getUsers } from "@/lib/supabase/getUsers";
import { getResults } from "@/lib/supabase/getResults";
import { calculateResults } from "@/lib/supabase/calculateResults";
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
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const unwrappedParams = use(params);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // 미팅 정보 가져오기
                const meetingResult = await getMeeting(unwrappedParams.id);
                if (meetingResult.success) {
                    console.log("Meeting data loaded:", meetingResult.data); // 디버깅용
                    console.log("=== Meeting selectable_time debug ===");
                    const selectableTime = meetingResult.data.selectable_time;
                    if (selectableTime) {
                        console.log("Raw selectable_time:", selectableTime);
                        console.log(
                            "Start time (minutes):",
                            selectableTime.start
                        );
                        console.log("End time (minutes):", selectableTime.end);
                        console.log(
                            "Start time (hours):",
                            selectableTime.start
                                ? `${Math.floor(
                                      selectableTime.start / 60
                                  )}:${String(
                                      selectableTime.start % 60
                                  ).padStart(2, "0")}`
                                : "undefined"
                        );
                        console.log(
                            "End time (hours):",
                            selectableTime.end
                                ? `${Math.floor(
                                      selectableTime.end / 60
                                  )}:${String(selectableTime.end % 60).padStart(
                                      2,
                                      "0"
                                  )}`
                                : "undefined"
                        );
                    }
                    console.log("===============================");
                    setMeeting(meetingResult.data);
                } else {
                    console.error(
                        "Failed to fetch meeting:",
                        meetingResult.message
                    );
                    // 미팅을 찾을 수 없으면 404 페이지 표시
                    notFound();
                    return;
                }

                // 사용자 목록 가져오기
                const usersResult = await getUsers(unwrappedParams.id);
                if (usersResult.success) {
                    setUsers(usersResult.data.users);
                    console.log("Users loaded:", usersResult.data.users); // 디버깅용
                } else {
                    console.error(
                        "Failed to fetch users:",
                        usersResult.message
                    );
                }

                // 결과 데이터 가져오기
                const resultsResult = await getResults(unwrappedParams.id);
                if (resultsResult.success) {
                    console.log(
                        "Results loaded from database:",
                        resultsResult.data.results
                    ); // 디버깅용
                    console.log(
                        "Sample result data:",
                        resultsResult.data.results[0]
                    ); // 첫 번째 결과 상세
                    console.log(
                        "All result dates:",
                        resultsResult.data.results.map((r) => r.date)
                    ); // 모든 날짜
                    console.log(
                        "All result times:",
                        resultsResult.data.results.map((r) => r.start_time)
                    ); // 모든 시간
                    setResults(resultsResult.data.results);

                    // 결과가 없고 사용자가 있으면 자동으로 결과 계산 실행
                    if (
                        resultsResult.data.results.length === 0 &&
                        usersResult.success &&
                        usersResult.data.users.length > 0
                    ) {
                        console.log("No results found, calculating results...");
                        await handleCalculateResults();
                    }
                } else {
                    console.error(
                        "Failed to fetch results:",
                        resultsResult.message
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // 에러 발생 시에도 404 표시
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [unwrappedParams.id]);

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
        router.push(`/${unwrappedParams.id}/edit`);
    };

    const handleUserSelect = (userId) => {
        console.log("User selected:", userId);
        setSelectedUser((prev) => (prev === userId ? null : userId));
    };

    // 새 사용자가 추가되었을 때 목록 업데이트
    const handleUserAdded = async () => {
        const usersResult = await getUsers(unwrappedParams.id);
        if (usersResult.success) {
            setUsers(usersResult.data.users);
        }

        // 결과 데이터도 다시 가져오기 (submitAvailability에서 이미 계산됨)
        const resultsResult = await getResults(unwrappedParams.id);
        if (resultsResult.success) {
            setResults(resultsResult.data.results);
        }
    };

    // loading 상태일 때만 Loading 컴포넌트 표시
    if (isLoading) return <Loading message="정보를 불러오고 있습니다..." />;

    // meeting이 없으면 이미 notFound()가 호출되었으므로 여기까지 오지 않음
    if (!meeting) return <Loading message="정보를 불러오고 있습니다..." />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
                <div className="px-10 py-8 flex flex-col gap-4">
                    <Title onChange={handleTitleChange}>{meeting.title}</Title>
                    <div className="mb-10">
                        <AvailableDatesGroup />
                    </div>

                    {/* 임시 디버깅 버튼 */}
                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={handleCalculateResults}
                            disabled={isCalculating}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            {isCalculating ? "계산 중..." : "결과 재계산"}
                        </button>
                        <div className="text-sm text-gray-500 self-center">
                            사용자: {users.length}명, 결과: {results.length}개
                            {selectedUser &&
                                ` | 선택: ${
                                    users.find((u) => u.userid === selectedUser)
                                        ?.name || selectedUser
                                }`}
                            {results.length > 0 && (
                                <div className="text-xs mt-1">
                                    첫 번째 결과: {results[0]?.date}{" "}
                                    {results[0]?.start_time}분 (
                                    {results[0]?.number}명)
                                </div>
                            )}
                        </div>
                    </div>

                    <h5 className="text-md text-gray-500 text-center font-semibold mb-1">
                        Schedule Overview
                    </h5>
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
                    />
                </div>
            </div>
            <div className="flex-shrink-0">
                <UserBar
                    meetingId={unwrappedParams.id}
                    users={users}
                    selectedUser={selectedUser}
                    onUserSelect={handleUserSelect}
                    onShowSelect={handleShowSelect}
                    onUserAdded={handleUserAdded}
                />
            </div>
        </div>
    );
}
