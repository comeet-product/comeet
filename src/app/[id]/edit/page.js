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
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [meeting, setMeeting] = useState(null);
    const [user, setUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
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
            
            let result;
            if (isEditMode && userId) {
                // 기존 사용자 수정
                result = await updateUserAvailability(userId, unwrappedParams.id, name.trim(), availableSlots);
            } else {
                // 새 사용자 추가
                result = await submitAvailability(unwrappedParams.id, name.trim(), availableSlots);
            }
            
            if (result.success) {
                alert(isEditMode ? '사용자 정보가 성공적으로 수정되었습니다.' : '성공적으로 저장되었습니다.');
                
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

    if (!meeting) {
        return (
            <div className="flex items-center justify-center h-full">
                <div>미팅 정보를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
                <div className="px-10 py-8 flex flex-col gap-4">
                    <Title link={false} editable={false}>
                        {meeting.title}
                    </Title>
                    <div className="w-full flex-1 min-h-0">
                        <TimetableSelect 
                            selectedSlots={selectedSlots}
                            onSlotsChange={setSelectedSlots}
                            meeting={meeting}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 px-10 pb-8">
                <form onSubmit={handleSubmit} className="flex justify-between gap-2 w-full">
                    <div className="flex-1">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            onCheckDuplicate={() => false}
                            disabled={isSubmitting}
                        />
                    </div>
                    <Button 
                        size="small"
                        onClick={handleSubmit}
                        disabled={!name.trim() || selectedSlots.size === 0 || isSubmitting}
                        className="whitespace-nowrap"
                    >
                        {isSubmitting ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정 완료' : '저장')}
                    </Button>
                </form>
            </div>
        </div>
    );
} 