"use client";

import { supabase } from "../supabase.js";

/**
 * 연속된 시간 블록을 찾아 추천 시간 생성
 * @param {Object} timeMap - 날짜별 시간대별 사용자 맵
 * @returns {Array} 추천 시간 배열
 */
function calculateContinuousBlocks(timeMap) {
    const recommendations = [];

    Object.entries(timeMap).forEach(([date, timeSlots]) => {
        // 시간대별로 정렬
        const sortedTimes = Object.keys(timeSlots)
            .map(Number)
            .sort((a, b) => a - b);

        // 각 시간대에서 시작하는 연속 블록 찾기
        for (let i = 0; i < sortedTimes.length; i++) {
            const startTime = sortedTimes[i];
            const startUsers = timeSlots[startTime];

            // 연속된 시간 블록 찾기 (최소 1시간 = 2블록)
            for (let duration = 2; duration <= 8; duration++) {
                let canContinue = true;
                let commonUsers = [...startUsers];

                // duration 길이만큼 연속으로 가능한지 확인
                for (let j = 1; j < duration; j++) {
                    const currentTime = startTime + j * 30;
                    if (!timeSlots[currentTime]) {
                        canContinue = false;
                        break;
                    }
                    // 공통 사용자만 남기기
                    commonUsers = commonUsers.filter((user) =>
                        timeSlots[currentTime].includes(user)
                    );
                }

                if (canContinue && commonUsers.length > 0) {
                    recommendations.push({
                        date,
                        start_time: startTime,
                        duration,
                        members: commonUsers,
                        number: commonUsers.length,
                    });
                }
            }
        }
    });

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
                data: { recommendations: [], results: [] },
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

        // 5. 모든 시간대별 결과 계산 (result 테이블용)
        const results = [];
        const { start, end, interval } = meetingData.selectable_time;

        Object.entries(timeMap).forEach(([date, timeSlots]) => {
            // 모든 가능한 시간대에 대해 결과 생성
            for (let time = start; time < end; time += interval) {
                const members = timeSlots[time] || [];
                results.push({
                    meeting_id: meetingId,
                    date,
                    start_time: time,
                    members,
                    number: members.length,
                });
            }
        });

        // 6. 기존 recommendation, result 데이터 삭제
        await supabase
            .from("recommendation")
            .delete()
            .eq("meeting_id", meetingId);
        await supabase.from("result").delete().eq("meeting_id", meetingId);

        // 7. recommendation 테이블에 저장
        if (recommendations.length > 0) {
            const recommendationData = recommendations
                .slice(0, 10)
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

        // 8. result 테이블에 저장
        if (results.length > 0) {
            const { error: resultError } = await supabase
                .from("result")
                .insert(results);

            if (resultError) {
                console.error("Error saving results:", resultError);
                throw resultError;
            }
        }

        return {
            success: true,
            message: "추천 시간이 성공적으로 계산되었습니다.",
            data: {
                recommendations: recommendations.slice(0, 10),
                totalResults: results.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "추천 시간 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
}
