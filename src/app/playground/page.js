"use client";

import { useState, useEffect } from "react";
import Title from "@/components/Title";
import Half from "@/components/TimetableComponent/Half";
import Hour from "@/components/TimetableComponent/Hour";
import Day from "@/components/TimetableComponent/Day";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import Date from "@/components/TimetableComponent/DateCell";
import Time from "@/components/TimetableComponent/Time";
import TimetableComponent from "@/components/TimetableComponent/TimetableComponent";
import TimetableSelect from "@/components/TimetableComponent/TimetableSelect";
import TimetableResult from "@/components/TimetableComponent/TimetableResult";
import Button from "@/components/Button";
import AvailableTime from "@/components/AvailableDatesGroup/AvailableTime";
import AvailableDate from "@/components/AvailableDatesGroup/AvailableDate";
import AvailableDates from "@/components/AvailableDatesGroup/AvailableDates";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";
import Calendar from "@/components/Calendar";
import UserBar from "@/components/UserBar";
import Input from "@/components/Input";
import Loading from "@/components/Loading";

// Supabase 함수들 import
import { getMeeting } from "@/lib/supabase/getMeeting";
import { getUsers } from "@/lib/supabase/getUsers";
import { getResults } from "@/lib/supabase/getResults";
import { getUserAvailability } from "@/lib/supabase/getUserAvailability";
import { submitAvailability } from "@/lib/supabase/submitAvailability";

export default function Playground() {
    // 실제 데이터 상태
    const [meeting, setMeeting] = useState(null);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserAvailability, setSelectedUserAvailability] = useState(null);
    const [loading, setLoading] = useState(true);

    // 새 사용자 추가 폼 상태
    const [newUserName, setNewUserName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 테스트용 meetingId (실제 데이터베이스에 있는 ID로 변경 필요)
    const TEST_MEETING_ID = "your-meeting-id-here"; // 실제 meetingId로 변경하세요

    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Meeting 정보 가져오기
                const meetingResult = await getMeeting(TEST_MEETING_ID);
                if (meetingResult.success) {
                    setMeeting(meetingResult.data);
                }

                // 사용자 목록 가져오기
                const usersResult = await getUsers(TEST_MEETING_ID);
                if (usersResult.success) {
                    setUsers(usersResult.data.users);
                }

                // 결과 데이터 가져오기
                const resultsResult = await getResults(TEST_MEETING_ID);
                if (resultsResult.success) {
                    setResults(resultsResult.data.results);
                }

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (TEST_MEETING_ID !== "your-meeting-id-here") {
            loadData();
        } else {
            setLoading(false);
        }
    }, []);

    // 사용자 선택 처리
    const handleUserSelect = async (userId) => {
        const newSelectedUser = selectedUser === userId ? null : userId;
        setSelectedUser(newSelectedUser);

        if (newSelectedUser) {
            // 선택된 사용자의 availability 가져오기
            const availabilityResult = await getUserAvailability(newSelectedUser);
            if (availabilityResult.success) {
                setSelectedUserAvailability(availabilityResult.data.availability);
            }
        } else {
            setSelectedUserAvailability(null);
        }
    };

    // 새 사용자 추가 처리
    const handleAddUser = async () => {
        if (!newUserName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        
        try {
            // 테스트용 더미 availability 데이터 (실제로는 TimetableSelect에서 생성됨)
            const testAvailability = {
                "2024-05-19": [1000, 1030, 1100, 1130], // 10:00, 10:30, 11:00, 11:30
                "2024-05-20": [1400, 1430, 1500], // 14:00, 14:30, 15:00
                "2024-05-21": [900, 930, 1000], // 09:00, 09:30, 10:00
            };

            const result = await submitAvailability(TEST_MEETING_ID, newUserName.trim(), testAvailability);
            
            if (result.success) {
                alert('사용자가 성공적으로 추가되었습니다!');
                setNewUserName('');
                
                // 데이터 다시 불러오기
                await handleUserAdded();
            } else {
                alert(`오류: ${result.message}`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('사용자 추가 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 사용자 추가 후 콜백
    const handleUserAdded = async () => {
        // 사용자 목록 다시 불러오기
        const usersResult = await getUsers(TEST_MEETING_ID);
        if (usersResult.success) {
            setUsers(usersResult.data.users);
        }

        // 결과 데이터 다시 불러오기
        const resultsResult = await getResults(TEST_MEETING_ID);
        if (resultsResult.success) {
            setResults(resultsResult.data.results);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl text-black font-bold mb-8 text-center">
                컴포넌트 플레이그라운드
                <Title />
            </h1>

            <div className="mb-8">
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    실제 데이터 연결 테스트
                </h3>
                
                {loading ? (
                    <div className="mb-6 p-4 bg-gray-100 rounded">
                        <Loading />
                        <p className="text-sm text-gray-500 mt-2">데이터를 로딩 중입니다...</p>
                    </div>
                ) : TEST_MEETING_ID === "your-meeting-id-here" ? (
                    <div className="mb-6 p-4 bg-yellow-100 rounded">
                        <p className="text-sm text-yellow-800">
                            실제 데이터를 테스트하려면 playground/page.js의 TEST_MEETING_ID를 실제 meetingId로 변경하세요.
                        </p>
                    </div>
                ) : (
                    <div className="mb-6 space-y-4">
                        <div className="p-4 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                                Meeting: {meeting?.title || 'N/A'} | 
                                Users: {users.length}명 | 
                                Results: {results.length}개 |
                                Selected: {selectedUser ? users.find(u => u.userid === selectedUser)?.name : 'None'}
                            </p>
                        </div>

                        {/* 새 사용자 추가 테스트 폼 */}
                        <div className="p-4 bg-green-50 rounded">
                            <h4 className="text-md text-green-800 mb-2">새 사용자 추가 테스트</h4>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder="사용자 이름 입력"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                                    disabled={isSubmitting}
                                />
                                <button
                                    onClick={handleAddUser}
                                    disabled={!newUserName.trim() || isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? '추가 중...' : '사용자 추가'}
                                </button>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                더미 availability 데이터로 테스트됩니다 (5/19: 10-12시, 5/20: 14-16시, 5/21: 9-11시)
                            </p>
                        </div>

                        {/* 실제 데이터로 동작하는 TimetableResult */}
                        <div>
                            <h4 className="text-md text-gray-600 mb-2">실제 데이터 TimetableResult</h4>
                            <TimetableResult
                                dayCount={7}
                                halfCount={16}
                                startDate="05/19"
                                startTime={10}
                                dateHeaderHeight={23}
                                meetingId={TEST_MEETING_ID}
                                meeting={meeting}
                                results={results}
                                users={users}
                                selectedUser={selectedUser}
                                selectedUserAvailability={selectedUserAvailability}
                            />
                        </div>

                        {/* 실제 데이터로 동작하는 UserBar */}
                        <div className="relative">
                            <h4 className="text-md text-gray-600 mb-2">실제 데이터 UserBar</h4>
                            <UserBar 
                                meetingId={TEST_MEETING_ID}
                                users={users}
                                selectedUser={selectedUser}
                                onUserSelect={handleUserSelect}
                                onShowSelect={() => console.log('Navigate to edit')}
                                onUserAdded={handleUserAdded}
                            />
                        </div>
                    </div>
                )}

                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    기본 컴포넌트들 (더미 데이터)
                </h3>
                <div className="mb-6">
                    <h4 className="text-md text-gray-600 mb-2">더미 데이터 TimetableResult</h4>
                    <TimetableResult />
                </div>

                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    TimetableSelect
                </h3>
                <div className="mb-6">
                    <TimetableSelect />
                </div>
                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Full Week Timetable (like image: 7 days, 8 halves, 10 AM
                        start)
                    </h4>
                    <TimetableComponent
                        dayCount={8}
                        halfCount={8}
                        startDate="05/19"
                        startTime={10}
                        dateHeaderHeight={23}
                    />
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        타임테이블
                    </h3>
                    <div className="space-y-6">
                        <TimetableComponent
                            dayCount={7}
                            halfCount={8}
                            startDate="05/19"
                            startTime={10}
                            dateHeaderHeight={23}
                        />
                        <TimetableComponent
                            dayCount={5}
                            halfCount={6}
                            startDate="11/18"
                            startTime={9}
                            dateHeaderHeight={23}
                        />
                        <TimetableComponent
                            dayCount={3}
                            halfCount={4}
                            startDate="12/01"
                            startTime={14}
                            dateHeaderHeight={23}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        시간 표시
                    </h3>
                    <div className="flex gap-4">
                        <Time time="10 AM" />
                        <Time time="11 AM" />
                        <Time time="12 PM" />
                        <Time time="1 PM" />
                        <Time time="2 PM" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        기본 컴포넌트
                    </h3>
                    <div className="space-y-4">
                        <Date date="11/15" isFirstDay={true} />
                        <Half
                            isTop={true}
                            isFirstHour={true}
                            isFirstDay={true}
                            hasHourAbove={true}
                        />
                        <Hour isFirst={true} isFirstDay={true} />
                        <Day halfCount={3} isFirstDay={true} />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        버튼
                    </h3>
                    <div className="space-y-4">
                        <Button size="large">큰 버튼</Button>
                        <Button size="small">작은 버튼</Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        시간 선택
                    </h3>
                    <div className="space-y-4">
                        <SelectableTime />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        가능한 시간
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <AvailableTime
                                text="30분"
                                backgroundColor="rgba(54, 116, 181, 0.60)"
                            />
                            <AvailableTime
                                text="1시간"
                                backgroundColor="rgba(54, 116, 181, 0.70)"
                            />
                            <AvailableTime
                                text="1.5시간"
                                backgroundColor="rgba(54, 116, 181, 0.75)"
                            />
                            <AvailableTime
                                text="2시간"
                                backgroundColor="rgba(54, 116, 181, 0.80)"
                            />
                            <AvailableTime
                                text="2.5시간"
                                backgroundColor="rgba(54, 116, 181, 0.85)"
                            />
                            <AvailableTime
                                text="3시간"
                                backgroundColor="rgba(54, 116, 181, 0.90)"
                            />
                            <AvailableTime
                                text="3.5시간"
                                backgroundColor="rgba(54, 116, 181, 0.95)"
                            />
                            <AvailableTime
                                text="4시간+"
                                backgroundColor="rgba(54, 116, 181, 1)"
                            />
                        </div>
                        <AvailableDate
                            date="5월 19일"
                            timeText="30분"
                            backgroundColor="rgba(54, 116, 181, 0.60)"
                        />
                        <AvailableDates />
                        <AvailableDatesGroup />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        캘린더
                    </h3>
                    <Calendar />
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        사용자 인터페이스 (더미 데이터)
                    </h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <UserBar />
                        </div>
                        <Input />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        로딩
                    </h3>
                    <Loading />
                </div>
            </div>
        </div>
    );
}
