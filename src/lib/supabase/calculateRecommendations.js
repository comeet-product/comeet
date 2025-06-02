import { supabase } from "../supabase.js";

/**
 * 연속된 시간 블록 계산
 * @param {Object} timeMap - 날짜별 시간 슬롯 맵
 * @returns {Array} 추천 시간 블록 배열
 */
function calculateContinuousBlocks(timeMap) {
    const recommendations = [];

    // 각 날짜별로 처리
    Object.entries(timeMap).forEach(([date, slots]) => {
        const times = Object.keys(slots)
            .map(Number)
            .sort((a, b) => a - b);
        let currentBlock = null;

        // 연속된 시간 블록 찾기
        for (let i = 0; i < times.length; i++) {
            const time = times[i];
            const users = slots[time];

            if (!currentBlock) {
                currentBlock = {
                    date,
                    start_time: time,
                    length: 1,
                    count: users.length,
                    users: [...users],
                };
            } else if (
                time ===
                currentBlock.start_time + currentBlock.length * 30
            ) {
                // 연속된 시간 블록 확장
                currentBlock.length++;
                currentBlock.count = Math.min(currentBlock.count, users.length);
                currentBlock.users = currentBlock.users.filter((user) =>
                    users.includes(user)
                );
            } else {
                // 새로운 블록 시작
                if (currentBlock.length >= 2) {
                    recommendations.push(currentBlock);
                }
                currentBlock = {
                    date,
                    start_time: time,
                    length: 1,
                    count: users.length,
                    users: [...users],
                };
            }
        }

        // 마지막 블록 처리
        if (currentBlock && currentBlock.length >= 2) {
            recommendations.push(currentBlock);
        }
    });

    return recommendations;
}

/**
 * 미팅 추천 시간 계산 및 저장
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function calculateRecommendations(meetingId) {
    try {
        // 1. 가용성 데이터 가져오기
        const { data: availabilityData, error: fetchError } = await supabase
            .from("availabilities")
            .select("participants")
            .eq("meeting_id", meetingId)
            .single();

        if (fetchError) {
            console.error("Error fetching availability data:", fetchError);
            throw fetchError;
        }

        if (!availabilityData || !availabilityData.participants) {
            throw new Error("가용성 데이터가 없습니다.");
        }

        // 2. 시간별 가용 사용자 맵 생성
        const timeMap = {};
        availabilityData.participants.forEach((participant) => {
            if (!participant.available_slots) return;

            Object.entries(participant.available_slots).forEach(
                ([date, slots]) => {
                    if (!Array.isArray(slots)) return;

                    if (!timeMap[date]) {
                        timeMap[date] = {};
                    }
                    slots.forEach((time) => {
                        if (typeof time !== "number") return;

                        if (!timeMap[date][time]) {
                            timeMap[date][time] = [];
                        }
                        timeMap[date][time].push(participant.name);
                    });
                }
            );
        });

        // 3. 연속된 시간 블록 계산
        const recommendations = calculateContinuousBlocks(timeMap);

        // 4. 추천 시간 저장
        const { error: updateError } = await supabase
            .from("meetings")
            .update({ recommendations })
            .eq("meeting_id", meetingId);

        if (updateError) {
            console.error("Error updating recommendations:", updateError);
            throw updateError;
        }

        return {
            success: true,
            message: "추천 시간이 성공적으로 계산되었습니다.",
            data: recommendations,
        };
    } catch (error) {
        return {
            success: false,
            message: "추천 시간 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
}
