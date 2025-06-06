"use client";

import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitAvailability, updateUserAvailability } from "@/lib/supabase/submitAvailability";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { getUser } from "@/lib/supabase/getUsers";
import { getUserAvailability } from "@/lib/supabase/getUserAvailability";
import Title from "@/components/Title";
import TimetableSelect from "@/components/TimetableComponent/TimetableSelect";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function EditPage({ params }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [meeting, setMeeting] = useState(null);
    const [user, setUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasExistingPassword, setHasExistingPassword] = useState(false);
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [verificationPassword, setVerificationPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const unwrappedParams = use(params);
    const userId = searchParams.get('userId');

    // availability를 시간 슬롯으로 변환하는 함수
    const convertAvailabilityToSlots = (availability, meeting) => {
        const slots = new Set();
        const selectedDates = meeting?.dates || [];

        console.log('=== Converting availability to slots ===');
        console.log('Availability:', availability);
        console.log('Meeting dates:', selectedDates);
        console.log('Meeting selectable_time:', meeting?.selectable_time);

        // HHMM 형식(900 = 9:00)을 분 단위로 변환하는 함수
        const convertHHMMToMinutes = (hhmm) => {
            const hours = Math.floor(hhmm / 100);
            const minutes = hhmm % 100;
            return hours * 60 + minutes;
        };

        Object.entries(availability).forEach(([date, times]) => {
            const dateIndex = selectedDates.indexOf(date);
            console.log(`Processing date ${date}, index: ${dateIndex}`);
            
            if (dateIndex !== -1 && Array.isArray(times)) {
                times.forEach(time => {
                    // 시간을 halfIndex로 변환
                    const startTimeHHMM = meeting?.selectable_time?.start || 900;
                    const startTimeMinutes = convertHHMMToMinutes(startTimeHHMM);
                    const timeMinutes = convertHHMMToMinutes(time);
                    const halfIndex = Math.floor((timeMinutes - startTimeMinutes) / 30);
                    
                    console.log(`Time ${time} -> ${timeMinutes} minutes -> halfIndex ${halfIndex}`);
                    
                    if (halfIndex >= 0) {
                        const slotId = `${dateIndex}-${halfIndex}`;
                        slots.add(slotId);
                        console.log(`Added slot: ${slotId}`);
                    }
                });
            }
        });

        console.log('Final slots:', Array.from(slots));
        return slots;
    };

    // 미팅 데이터 가져오기
    useEffect(() => {
        const fetchMeeting = async () => {
            const meetingResult = await getMeeting(unwrappedParams.id);
            if (meetingResult.success) {
                console.log('Meeting data loaded in edit page:', meetingResult.data);
                setMeeting(meetingResult.data);
            } else {
                console.error("Failed to fetch meeting:", meetingResult.message);
                alert("미팅 정보를 불러올 수 없습니다.");
                router.push(`/${unwrappedParams.id}`);
            }
        };
        
        fetchMeeting();
    }, [unwrappedParams.id, router]);

    // 유저 정보 및 availability 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            if (userId && meeting) {
                setIsEditMode(true);
                
                try {
                    // 사용자 정보 가져오기
                    const userResult = await getUser(userId);
                    if (userResult.success) {
                        console.log('User data loaded:', userResult.data);
                        setUser(userResult.data);
                        setName(userResult.data.name);
                        setPassword(userResult.data.password || '');
                        
                        // 기존 비밀번호 유무 확인 (향후 플로우 분리용)
                        const existingPasswordExists = userResult.data.password !== null && userResult.data.password !== undefined && userResult.data.password !== '';
                        setHasExistingPassword(existingPasswordExists);
                        console.log('User has existing password:', existingPasswordExists);
                        
                        // 비밀번호가 있는 경우 verification overlay 표시
                        if (existingPasswordExists) {
                            setShowPasswordVerification(true);
                        } else {
                            setIsVerified(true);
                        }
                    } else {
                        console.error("Failed to fetch user:", userResult.message);
                        alert("사용자 정보를 불러올 수 없습니다.");
                        router.push(`/${unwrappedParams.id}`);
                        return;
                    }

                    // 사용자 availability 가져오기
                    const availabilityResult = await getUserAvailability(userId);
                    if (availabilityResult.success) {
                        console.log('User availability loaded:', availabilityResult.data.availability);
                        const slots = convertAvailabilityToSlots(availabilityResult.data.availability, meeting);
                        setSelectedSlots(slots);
                    } else {
                        console.error("Failed to fetch user availability:", availabilityResult.message);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
                    router.push(`/${unwrappedParams.id}`);
                }
            } else {
                setIsEditMode(false);
                setIsVerified(true); // 새 사용자 추가 모드는 바로 편집 가능
            }
        };

        fetchUserData();
    }, [userId, meeting, unwrappedParams.id, router]);

    // 시간 슬롯을 날짜와 시간으로 변환하는 함수
    const convertSlotsToAvailability = (slots) => {
        const availability = {};
        const selectedDates = meeting?.dates || [];
        
        // HHMM 형식(900 = 9:00)을 분 단위로 변환하는 함수
        const convertHHMMToMinutes = (hhmm) => {
            const hours = Math.floor(hhmm / 100);
            const minutes = hhmm % 100;
            return hours * 60 + minutes;
        };

        // 분 단위를 HHMM 형식으로 변환하는 함수
        const convertMinutesToHHMM = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours * 100 + mins;
        };
        
        console.log('=== Converting slots to availability ===');
        console.log('Meeting selectable_time:', meeting?.selectable_time);
        console.log('Selected slots:', Array.from(slots));
        console.log('Selected dates:', selectedDates);
        
        slots.forEach(slotId => {
            const [dayIndex, halfIndex] = slotId.split('-').map(Number);
            
            console.log(`Processing slot: ${slotId} (day: ${dayIndex}, half: ${halfIndex})`);
            
            // 선택된 날짜 배열에서 해당 인덱스의 날짜 가져오기
            if (dayIndex < selectedDates.length) {
                const dateString = selectedDates[dayIndex]; // 이미 YYYY-MM-DD 형식
                
                // 시간 계산 (HHMM 형식을 분 단위로 변환 후 다시 HHMM으로)
                const startTimeHHMM = meeting?.selectable_time?.start || 900; // 기본값 9시 (900)
                const startTimeMinutes = convertHHMMToMinutes(startTimeHHMM);
                const timeMinutes = startTimeMinutes + (halfIndex * 30);
                const timeHHMM = convertMinutesToHHMM(timeMinutes); // HHMM 형식으로 변환
                
                console.log('Time calculation:', {
                    startTimeHHMM,
                    startTimeMinutes,
                    halfIndex,
                    calculatedTimeMinutes: timeMinutes,
                    calculatedTimeHHMM: timeHHMM,
                    timeInHours: `${Math.floor(timeMinutes / 60)}:${String(timeMinutes % 60).padStart(2, '0')}`
                });
                
                if (!availability[dateString]) {
                    availability[dateString] = [];
                }
                availability[dateString].push(timeHHMM); // HHMM 형식으로 저장
            }
        });
        
        // 각 날짜의 시간을 정렬
        Object.keys(availability).forEach(date => {
            availability[date].sort((a, b) => a - b);
        });
        
        console.log('=== Final converted availability ===');
        console.log('Availability object:', availability);
        Object.entries(availability).forEach(([date, times]) => {
            console.log(`Date ${date}:`, times.map(t => {
                const hours = Math.floor(t / 100);
                const mins = t % 100;
                return `${hours}:${String(mins).padStart(2, '0')} (${t})`;
            }));
        });
        
        return availability;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (selectedSlots.size === 0) {
            alert('가능한 시간을 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // 선택된 슬롯을 availability 형식으로 변환
            const availableSlots = convertSlotsToAvailability(selectedSlots);
            
            // 비밀번호 처리
            let userPassword;
            if (isEditMode && hasExistingPassword && isVerified) {
                // Case 2: 기존 비밀번호가 있는 사용자의 수정
                userPassword = password.trim() || user?.password; // 비워두면 기존 비밀번호 유지
            } else {
                // Case 1: 비밀번호가 없는 사용자의 수정 또는 새 사용자 추가
                userPassword = password.trim() || null;
            }
            
            console.log('Submit - Is edit mode:', isEditMode);
            console.log('Submit - Has existing password:', hasExistingPassword);
            console.log('Submit - New password provided:', userPassword !== null);
            console.log('Submit - Meeting ID:', unwrappedParams.id);
            console.log('Submit - User name:', name.trim());
            console.log('Submit - Available slots:', availableSlots);
            
            let result;
            if (isEditMode && userId) {
                // 기존 사용자 수정
                console.log('Updating existing user:', userId);
                result = await updateUserAvailability(userId, unwrappedParams.id, name.trim(), availableSlots, userPassword);
            } else {
                // 새 사용자 추가
                console.log('Creating new user...');
                result = await submitAvailability(unwrappedParams.id, name.trim(), availableSlots, userPassword);
                console.log('New user creation result:', result);
            }
            
            if (result.success) {
                const successMessage = isEditMode 
                    ? '사용자 정보가 성공적으로 수정되었습니다.' 
                    : `${name.trim()}님이 성공적으로 추가되었습니다.`;
                alert(successMessage);
                console.log('Success! Redirecting to main page...');
                
                // 수정 모드일 때는 수정한 사용자를 선택된 상태로 돌아가기
                if (isEditMode && userId) {
                    router.push(`/${unwrappedParams.id}?selectedUser=${userId}&scrollTo=result`);
                } else if (result.data && result.data.userid) {
                    // 새 사용자 추가일 때는 새로 생성된 사용자를 선택된 상태로 돌아가기
                    router.push(`/${unwrappedParams.id}?selectedUser=${result.data.userid}&scrollTo=result`);
                } else {
                    router.push(`/${unwrappedParams.id}`);
                }
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('저장 중 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push(`/${unwrappedParams.id}`);
    };

    const handlePasswordVerification = async () => {
        if (!verificationPassword.trim()) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
            return;
        }

        setIsVerifying(true);
        
        // 입력한 비밀번호와 기존 비밀번호 비교
        if (verificationPassword.trim() === (user?.password || '')) {
            setIsVerified(true);
            setShowPasswordVerification(false);
        } else {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
        }
        
        setIsVerifying(false);
    };

    const handleVerificationBack = () => {
        router.push(`/${unwrappedParams.id}`);
    };

    if (!meeting) {
        return (
            <div className="flex items-center justify-center h-full">
                <div>미팅 정보를 불러오는 중...</div>
            </div>
        );
    }

    // 비밀번호 확인 overlay
    if (showPasswordVerification) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg text-black font-medium">비밀번호 확인</h2>
                        <button 
                            onClick={handleVerificationBack}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-main"
                            disabled={isVerifying}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <Input
                            type="password"
                            value={verificationPassword}
                            onChange={(e) => setVerificationPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            disabled={isVerifying}
                            className="text-sm"
                        />
                    </div>
                    
                    <Button 
                        size="small"
                        onClick={handlePasswordVerification}
                        disabled={!verificationPassword.trim() || isVerifying}
                        className="w-full"
                    >
                        {isVerifying ? '확인 중...' : '확인'}
                    </Button>
                </div>
                
                {/* 토스트 메시지 */}
                {showToast && (
                    <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 bg-main text-white px-3 py-2 rounded-full text-xs whitespace-nowrap shadow-md z-50 transition-opacity duration-500">
                        비밀번호가 틀렸습니다
                    </div>
                )}
            </div>
        );
    }

    // 메인 편집 화면
    return (
        <div className="px-8 py-6 flex flex-col gap-6">
            <div className="relative flex items-center justify-center">
                <button 
                    onClick={handleBack}
                    className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-main"
                    disabled={isSubmitting}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <Title link={false} editable={false}>
                    {meeting.title}
                </Title>
            </div>
            
            <div className="flex-1">
                <TimetableSelect 
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    meeting={meeting}
                />
            </div>
            
            <div>
                <form onSubmit={handleSubmit} className="flex gap-3 w-full items-stretch">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="h-10">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                onCheckDuplicate={() => false}
                                disabled={isSubmitting}
                                className="text-sm"
                            />
                        </div>
                        
                        {/* 새 사용자 추가 또는 기존 비밀번호가 있고 확인된 경우 - 비밀번호 입력 표시 */}
                        {(!isEditMode || (hasExistingPassword && isVerified)) && (
                            <div className="h-10">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={
                                        !isEditMode 
                                            ? "비밀번호 (선택)" 
                                            : "새 비밀번호 (변경 안 하려면 비워두세요)"
                                    }
                                    disabled={isSubmitting}
                                    className="text-sm"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center">
                        <Button 
                            size="small"
                            onClick={handleSubmit}
                            disabled={!name.trim() || selectedSlots.size === 0 || isSubmitting}
                            className="whitespace-nowrap px-4 text-sm h-full"
                        >
                            {isSubmitting ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '완료' : '저장')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 