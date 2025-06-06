"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅의 결과 데이터 계산 및 저장 (각 시간대별 참여 가능 인원)
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function calculateResults(meetingId) {
    try {
        console.log('=== calculateResults 시작 ===');
        console.log('Meeting ID:', meetingId);

        // 1. 미팅의 selectable_time 정보 가져오기
        const { data: meetingData, error: meetingError } = await supabase
            .from("meeting")
            .select("selectable_time")
            .eq("meetingid", meetingId)
            .single();

        if (meetingError) {
            console.error("미팅 데이터 조회 오류:", meetingError);
            throw meetingError;
        }

        console.log('미팅 데이터:', meetingData);

        // 2. 가용성 데이터 가져오기 (user 테이블과 조인)
        const { data: availabilityData, error: fetchError } = await supabase
            .from("availability")
            .select(`
                date,
                times,
                user:user_id (
                    name,
                    meetingid
                )
            `)
            .eq("user.meetingid", meetingId);

        if (fetchError) {
            console.error("가용성 데이터 조회 오류:", fetchError);
            throw fetchError;
        }

        console.log('가용성 데이터:', availabilityData?.length, '개 레코드');

        if (!availabilityData || availabilityData.length === 0) {
            console.log('가용성 데이터 없음 - 기존 결과 삭제');
            
            // 기존 결과 삭제
            const { error: deleteError } = await supabase
                .from("result")
                .delete()
                .eq("meeting_id", meetingId);
            
            if (deleteError) {
                console.error("기존 결과 삭제 오류:", deleteError);
                throw deleteError;
            }
            
            return {
                success: true,
                message: "가용성 데이터가 없습니다.",
                data: { results: [] },
            };
        }

        // 3. 시간별 가용 사용자 맵 생성
        const timeMap = {};
        availabilityData.forEach((record) => {
            if (!record.user || !record.times || !Array.isArray(record.times)) {
                console.log('잘못된 레코드 스킵:', record);
                return;
            }

            const date = record.date;
            const userName = record.user.name;

            if (!timeMap[date]) {
                timeMap[date] = {};
            }

            record.times.forEach((time) => {
                if (typeof time !== "number" || isNaN(time)) {
                    console.log('잘못된 시간:', time);
                    return;
                }

                if (!timeMap[date][time]) {
                    timeMap[date][time] = [];
                }
                timeMap[date][time].push(userName);
            });
        });

        console.log('시간 맵 생성 완료:', Object.keys(timeMap).length, '개 날짜');

        // 4. 모든 시간대별 결과 계산
        const results = [];
        const { start, end, interval } = meetingData.selectable_time;

        // HHMM 형식(900 = 9:00)을 분 단위로 변환
        const convertHHMMToMinutes = (hhmm) => {
            const hours = Math.floor(hhmm / 100);
            const minutes = hhmm % 100;
            return hours * 60 + minutes;
        };

        // 분 단위를 HHMM 형식으로 변환
        const convertMinutesToHHMM = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours * 100 + mins;
        };

        const startMinutes = convertHHMMToMinutes(start);
        const endMinutes = convertHHMMToMinutes(end);

        console.log('시간 설정:', { 
            start: start, 
            end: end, 
            interval: interval,
            startMinutes: startMinutes,
            endMinutes: endMinutes
        });

        Object.entries(timeMap).forEach(([date, timeSlots]) => {
            console.log(`날짜 ${date} 처리 중...`);
            
            for (let timeMinutes = startMinutes; timeMinutes < endMinutes; timeMinutes += interval) {
                const timeHHMM = convertMinutesToHHMM(timeMinutes);
                const members = timeSlots[timeHHMM] || [];
                
                if (members.length > 0) {
                    results.push({
                        meeting_id: meetingId,
                        date,
                        start_time: timeHHMM,
                        members,
                        number: members.length,
                    });
                    console.log(`결과 추가: ${date} ${timeHHMM} - ${members.length}명`);
                }
            }
        });

        console.log('계산된 결과:', results.length, '개');

        // 5. 기존 데이터 삭제 후 새 데이터 삽입
        console.log('기존 결과 삭제 중...');
        const { error: deleteError } = await supabase
            .from("result")
            .delete()
            .eq("meeting_id", meetingId);

        if (deleteError) {
            console.error("기존 결과 삭제 오류:", deleteError);
            throw deleteError;
        }

        console.log('기존 결과 삭제 완료');

        if (results.length > 0) {
            console.log('새 결과 삽입 중...');
            console.log('삽입할 결과 데이터 샘플:', JSON.stringify(results[0], null, 2));
            console.log('총 삽입할 결과 개수:', results.length);
            
            // 재시도 로직 추가 (더 많은 재시도와 조용한 처리)
            let insertSuccess = false;
            let retryCount = 0;
            const maxRetries = 5; // 재시도 횟수 증가
            
            while (!insertSuccess && retryCount < maxRetries) {
                try {
                    const { data: insertedData, error: insertError } = await supabase
                        .from("result")
                        .insert(results);

                    if (insertError) {
                        // 첫 번째 시도 실패는 조용히 처리
                        if (retryCount === 0) {
                            console.log('첫 번째 삽입 시도 실패, 재시도 중...');
                        } else if (retryCount < maxRetries - 1) {
                            console.log(`재시도 ${retryCount + 1}/${maxRetries} 진행 중...`);
                        }
                        
                        if (retryCount === maxRetries - 1) {
                            // 마지막 시도에서만 상세 에러 로그
                            console.error("모든 재시도 실패 - 에러 코드:", insertError.code);
                            console.error("에러 메시지:", insertError.message);
                            throw insertError;
                        } else {
                            // 재시도 전 대기 시간을 점진적으로 증가
                            const waitTime = 300 + (retryCount * 200); // 300ms, 500ms, 700ms, 900ms
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            retryCount++;
                            continue;
                        }
                    }

                    insertSuccess = true;
                    console.log('✅ 결과 삽입 완료:', results.length, '개');
                    
                } catch (error) {
                    if (retryCount < maxRetries - 1) {
                        console.log(`재시도 ${retryCount + 1}/${maxRetries} 중...`);
                        const waitTime = 300 + (retryCount * 200);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        retryCount++;
                    } else {
                        console.error("최종 삽입 실패:", error.message);
                        throw error;
                    }
                }
            }
        }

        return {
            success: true,
            message: "결과 데이터가 성공적으로 계산되었습니다.",
            data: {
                results: results,
                totalResults: results.length,
            },
        };

    } catch (error) {
        console.error("calculateResults 오류:", error);
        return {
            success: false,
            message: "결과 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
} 