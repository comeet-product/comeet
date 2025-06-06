"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { notFound } from "next/navigation";

export default function MeetingPage({ params }) {
    const [meeting, setMeeting] = useState(null);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserAvailability, setSelectedUserAvailability] =
        useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
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
            // 미팅 정보 가져오기
            const meetingResult = await getMeeting(unwrappedParams.id);
            if (!meetingResult.success) {
                // 데이터베이스에서 찾아봤는데 없음 → 404
                notFound();
            }
            if (meetingResult.success) {
                console.log("Meeting data loaded:", meetingResult.data); // 디버깅용
                console.log("=== Meeting selectable_time debug ===");
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
                console.error(
                    "Failed to fetch meeting:",
                    meetingResult.message
                );
            }

            // 사용자 목록 가져오기
            const usersResult = await getUsers(unwrappedParams.id);
            if (usersResult.success) {
                setUsers(usersResult.data.users);
                console.log("Users loaded:", usersResult.data.users); // 디버깅용

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
        if (selectedUser) {
            router.push(`/${unwrappedParams.id}/edit?userId=${selectedUser}`);
        } else {
            router.push(`/${unwrappedParams.id}/edit`);
        }
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

    if (!meeting) return <Loading message="정보를 불러오고 있습니다..." />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
                <div className="px-10 py-8 flex flex-col gap-4">
                    <Title onChange={handleTitleChange}>{meeting.title}</Title>
                    <div className="mb-10">
                        <AvailableDatesGroup />
                    </div>

                    <div ref={resultTableRef}>
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
