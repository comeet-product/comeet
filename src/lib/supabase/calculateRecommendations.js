"use client";

import { supabase } from "../supabase.js";

/**
 * HHMM 형식 시간에 분을 더하는 함수
 * @param {number} time - HHMM 형식의 시간 (예: 1630)
 * @param {number} minutes - 더할 분 (예: 30)
 * @returns {number} 계산된 HHMM 형식 시간
 */
function addMinutesToTime(time, minutes) {
    const hours = Math.floor(time / 100);
    const mins = time % 100;
    
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    
    return newHours * 100 + newMins;
}

/**
 * 연속된 시간 블록을 찾아 추천 시간 생성
 * @param {Object} timeMap - 날짜별 시간대별 사용자 맵
 * @returns {Array} 추천 시간 배열
 */
function calculateContinuousBlocks(timeMap) {
    const recommendations = [];

    console.log('=== calculateContinuousBlocks NEW ALGORITHM ===');
    console.log('timeMap:', timeMap);

    Object.entries(timeMap).forEach(([date, timeSlots]) => {
        console.log(`\n--- Processing date: ${date} ---`);
        console.log('timeSlots:', timeSlots);
        
        // 시간대별로 정렬
        const sortedTimes = Object.keys(timeSlots)
            .map(Number)
            .sort((a, b) => a - b);

        console.log('sortedTimes:', sortedTimes);

        // 각 시간 슬롯에 대해 멤버 구성과 함께 저장
        const timeSlotData = sortedTimes.map(time => ({
            time: time,
            members: timeSlots[time].sort(), // 정렬해서 비교하기 쉽게
            memberKey: timeSlots[time].sort().join(',') // 멤버 구성을 키로 사용
        }));

        console.log('timeSlotData:', timeSlotData);

        // 연속되는 같은 멤버 구성의 블록들을 찾기
        let i = 0;
        while (i < timeSlotData.length) {
            const startSlot = timeSlotData[i];
            let duration = 1;
            let j = i + 1;

            console.log(`\n🔍 Starting from time ${startSlot.time} with members:`, startSlot.members);
            console.log(`   Member key: "${startSlot.memberKey}"`);
            console.log(`   Current index i=${i}, checking from j=${j}`);

            // 연속되는 시간 슬롯들 중에서 같은 멤버 구성인 것들 찾기
            while (j < timeSlotData.length) {
                const currentSlot = timeSlotData[j];
                const expectedTime = addMinutesToTime(startSlot.time, duration * 30);
                
                console.log(`  📋 Checking slot ${j}: time ${currentSlot.time}, expected ${expectedTime}`);
                console.log(`     Current members: "${currentSlot.memberKey}"`);
                console.log(`     Start members: "${startSlot.memberKey}"`);
                console.log(`     Members match: ${currentSlot.memberKey === startSlot.memberKey}`);
                console.log(`     Time match: ${currentSlot.time === expectedTime}`);
                
                // 시간이 연속이고 멤버 구성이 같은지 확인
                if (currentSlot.time === expectedTime && currentSlot.memberKey === startSlot.memberKey) {
                    duration++;
                    console.log(`  ✅ Continuous block extended to duration ${duration}`);
                    j++;
                } else {
                    if (currentSlot.time !== expectedTime) {
                        console.log(`  ❌ Time not continuous: ${currentSlot.time} !== ${expectedTime}`);
                    }
                    if (currentSlot.memberKey !== startSlot.memberKey) {
                        console.log(`  ❌ Members different: "${currentSlot.memberKey}" !== "${startSlot.memberKey}"`);
                    }
                    console.log(`  ⏹️ Block ended`);
                    break;
                }
            }

            // 추천에 추가 (최소 1명 이상의 멤버가 있어야 함)
            if (startSlot.members.length > 0) {
                const recommendation = {
                    date,
                    start_time: startSlot.time,
                    duration: duration,
                    members: startSlot.members,
                    number: startSlot.members.length,
                };
                console.log(`🎯 Adding recommendation:`, recommendation);
                console.log(`   Duration: ${duration}, Members: ${startSlot.members.length} people`);
                recommendations.push(recommendation);
            }

            // 다음 블록으로 이동 (현재 블록의 끝 다음부터)
            const nextI = Math.max(i + 1, j);
            console.log(`🔄 Moving to next block: from i=${i} to i=${nextI}`);
            i = nextI;
        }
    });

    console.log('\n=== Final recommendations ===');
    console.log(recommendations);

    // 참여 인원 수와 지속 시간으로 정렬 (인원 많고, 시간 긴 순)
    return recommendations.sort((a, b) => {
        if (b.number !== a.number) return b.number - a.number;
        return b.duration - a.duration;
    });
}

/**
 * 미팅 추천 시간 계산 및 저장
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function calculateRecommendations(meetingId) {
    try {
        console.log('=== calculateRecommendations 시작 ===');
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
            console.log('가용성 데이터 없음');
            
            // 기존 추천 삭제
            const { error: deleteError } = await supabase
                .from("recommendation")
                .delete()
                .eq("meeting_id", meetingId);
            
            if (deleteError) {
                console.error("기존 추천 삭제 오류:", deleteError);
                throw deleteError;
            }
            
            return {
                success: true,
                message: "가용성 데이터가 없습니다.",
                data: { recommendations: [] },
            };
        }

        // 3. 시간별 가용 사용자 맵 생성
        const timeMap = {};
        availabilityData.forEach((record) => {
            if (!record.user || !record.times || !Array.isArray(record.times))
                return;

            const date = record.date;
            const userName = record.user.name;

            if (!timeMap[date]) {
                timeMap[date] = {};
            }

            record.times.forEach((time) => {
                if (typeof time !== "number" || isNaN(time)) return;

                if (!timeMap[date][time]) {
                    timeMap[date][time] = [];
                }
                timeMap[date][time].push(userName);
            });
        });

        console.log('시간 맵 생성 완료:', Object.keys(timeMap).length, '개 날짜');

        // 4. 연속된 시간 블록 계산 (추천 시간)
        const recommendations = calculateContinuousBlocks(timeMap);
        console.log('계산된 추천:', recommendations.length, '개');

        // 5. 기존 데이터 삭제 후 새 데이터 삽입
        console.log('기존 추천 삭제 중...');
        const { error: deleteError } = await supabase
            .from("recommendation")
            .delete()
            .eq("meeting_id", meetingId);

        if (deleteError) {
            console.error("기존 추천 삭제 오류:", deleteError);
            throw deleteError;
        }

        console.log('기존 추천 삭제 완료');

        if (recommendations.length > 0) {
            const recommendationData = recommendations
                .slice(0, 8)
                .map((rec) => ({
                    meeting_id: meetingId,
                    date: rec.date,
                    start_time: rec.start_time,
                    duration: rec.duration,
                    members: rec.members,
                    number: rec.number,
                }));

            console.log('새 추천 삽입 중...');
            console.log('삽입할 추천 데이터 개수:', recommendationData.length);
            
            // 재시도 로직 추가 (더 많은 재시도와 조용한 처리)
            let insertSuccess = false;
            let retryCount = 0;
            const maxRetries = 5; // 재시도 횟수 증가
            
            while (!insertSuccess && retryCount < maxRetries) {
                try {
                    const { data: insertedData, error: insertError } = await supabase
                        .from("recommendation")
                        .insert(recommendationData);

                    if (insertError) {
                        // 첫 번째 시도 실패는 조용히 처리
                        if (retryCount === 0) {
                            console.log('첫 번째 추천 삽입 시도 실패, 재시도 중...');
                        } else if (retryCount < maxRetries - 1) {
                            console.log(`추천 재시도 ${retryCount + 1}/${maxRetries} 진행 중...`);
                        }
                        
                        if (retryCount === maxRetries - 1) {
                            // 마지막 시도에서만 상세 에러 로그
                            console.error("모든 추천 재시도 실패 - 에러 코드:", insertError.code);
                            console.error("추천 에러 메시지:", insertError.message);
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
                    console.log('✅ 추천 삽입 완료:', recommendationData.length, '개');
                    
                } catch (error) {
                    if (retryCount < maxRetries - 1) {
                        console.log(`추천 재시도 ${retryCount + 1}/${maxRetries} 중...`);
                        const waitTime = 300 + (retryCount * 200);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        retryCount++;
                    } else {
                        console.error("최종 추천 삽입 실패:", error.message);
                        throw error;
                    }
                }
            }
        }

        return {
            success: true,
            message: "추천 시간이 성공적으로 계산되었습니다.",
            data: {
                recommendations: recommendations.slice(0, 8),
            },
        };
    } catch (error) {
        console.error("calculateRecommendations 오류:", error);
        
        return {
            success: false,
            message: "추천 시간 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
}
