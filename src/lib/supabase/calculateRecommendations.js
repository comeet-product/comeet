"use client";

import { supabase } from "../supabase.js";

/**
 * 연속된 시간 블록을 찾아 추천 시간 생성
 * @param {Object} timeMap - 날짜별 시간대별 사용자 맵
 * @returns {Array} 추천 시간 배열
 */
function calculateContinuousBlocks(timeMap) {
    const recommendations = [];

    console.log('=== calculateContinuousBlocks DEBUG ===');
    console.log('timeMap:', timeMap);

    Object.entries(timeMap).forEach(([date, timeSlots]) => {
        console.log(`\n--- Processing date: ${date} ---`);
        console.log('timeSlots:', timeSlots);
        
        // 시간대별로 정렬
        const sortedTimes = Object.keys(timeSlots)
            .map(Number)
            .sort((a, b) => a - b);

        console.log('sortedTimes:', sortedTimes);

        // 각 시간대에서 시작하는 연속 블록 찾기
        for (let i = 0; i < sortedTimes.length; i++) {
            const startTime = sortedTimes[i];
            const startUsers = timeSlots[startTime];

            console.log(`\nChecking startTime: ${startTime}, users:`, startUsers);

            // 해당 시작 시간에서 가능한 최대 연속 시간 찾기
            let maxDuration = 0; // 초기값을 0으로 설정
            let bestCommonUsers = [];

            // 최대 9블록(4시간 반)까지 확인
            for (let duration = 1; duration <= 9; duration++) {
                let commonUsers = [...startUsers];
                let allSlotsAvailable = true;

                console.log(`  Testing duration ${duration}:`);

                // duration 길이만큼 연속으로 가능한지 확인
                for (let j = 0; j < duration; j++) {
                    const currentTime = startTime + j * 30;
                    console.log(`    Checking slot ${j}: time ${currentTime}`);
                    
                    if (!timeSlots[currentTime]) {
                        console.log(`    Slot ${j} (${currentTime}) not available`);
                        allSlotsAvailable = false;
                        break;
                    }
                    
                    // 공통 사용자만 남기기
                    if (j > 0) { // 첫 번째 슬롯은 이미 포함됨
                        commonUsers = commonUsers.filter((user) =>
                            timeSlots[currentTime].includes(user)
                        );
                        console.log(`    After slot ${j}, common users:`, commonUsers);
                    }
                }

                if (allSlotsAvailable && commonUsers.length > 0) {
                    console.log(`  Duration ${duration} is possible with ${commonUsers.length} users:`, commonUsers);
                    maxDuration = duration;
                    bestCommonUsers = commonUsers;
                } else if (!allSlotsAvailable) {
                    // 슬롯이 없으면 더 이상 연속될 수 없으므로 중단
                    console.log(`  Duration ${duration} failed - no more slots available`);
                    break;
                } else {
                    // 공통 사용자가 없지만 슬롯은 있는 경우 - 계속 확인
                    console.log(`  Duration ${duration} failed - no common users, but continuing...`);
                }
            }

            // 최소 1블록 이상의 연속 시간이 있으면 추천에 추가
            if (maxDuration >= 1 && bestCommonUsers.length > 0) {
                const recommendation = {
                    date,
                    start_time: startTime,
                    duration: maxDuration,
                    members: bestCommonUsers,
                    number: bestCommonUsers.length,
                };
                console.log(`Adding recommendation:`, recommendation);
                recommendations.push(recommendation);
            }
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
        // 1. 미팅의 selectable_time 정보 가져오기
        const { data: meetingData, error: meetingError } = await supabase
            .from("meeting")
            .select("selectable_time")
            .eq("meetingid", meetingId)
            .single();

        if (meetingError) {
            console.error("Error fetching meeting data:", meetingError);
            throw meetingError;
        }

        // 2. 가용성 데이터 가져오기 (user 테이블과 조인)
        const { data: availabilityData, error: fetchError } = await supabase
            .from("availability")
            .select(
                `
                date,
                times,
                user:user_id (
                    name,
                    meetingid
                )
            `
            )
            .eq("user.meetingid", meetingId);

        if (fetchError) {
            console.error("Error fetching availability data:", fetchError);
            throw fetchError;
        }

        if (!availabilityData || availabilityData.length === 0) {
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

        // 4. 연속된 시간 블록 계산 (추천 시간)
        const recommendations = calculateContinuousBlocks(timeMap);

        // 5. 기존 recommendation 데이터 삭제
        await supabase
            .from("recommendation")
            .delete()
            .eq("meeting_id", meetingId);

        // 6. recommendation 테이블에 저장
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

            const { error: recError } = await supabase
                .from("recommendation")
                .insert(recommendationData);

            if (recError) {
                console.error("Error saving recommendations:", recError);
                throw recError;
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
        return {
            success: false,
            message: "추천 시간 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
}
