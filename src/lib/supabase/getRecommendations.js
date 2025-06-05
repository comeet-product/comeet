"use client";

import { supabase } from "../supabase.js";

/**
 * Duration을 시간으로 변환하는 헬퍼 함수
 * @param {number} duration - 30분 단위 duration (3 = 1.5시간)
 * @returns {number} 시간 단위 값
 */
function convertDurationToHours(duration) {
    return duration * 0.5; // 30분 = 0.5시간
}

/**
 * 시간을 읽기 쉬운 형태로 포맷하는 헬퍼 함수
 * @param {number} hours - 시간 (1.5, 2, 2.5 등)
 * @returns {string} 포맷된 시간 문자열 ("1.5시간", "2시간" 등)
 */
function formatDurationHours(hours) {
    if (hours === Math.floor(hours)) {
        return `${hours}시간`;
    } else {
        return `${hours}시간`;
    }
}

/**
 * 미팅의 추천 시간 조회 (스마트 정렬 및 제한)
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getRecommendations(meetingId) {
    try {
        const { data, error } = await supabase
            .from("recommendation")
            .select("*")
            .eq("meeting_id", meetingId);

        if (error) {
            console.error("Error fetching recommendations:", error);
            throw error;
        }

        // Duration을 시간으로 변환하여 추가
        const enrichedData = data.map((rec) => ({
            ...rec,
            durationInHours: convertDurationToHours(rec.duration),
            durationFormatted: formatDurationHours(
                convertDurationToHours(rec.duration)
            ),
        }));

        // 1. number(참여 인원)별로 그룹화
        const recommendationsByNumber = {};
        enrichedData.forEach((rec) => {
            if (!recommendationsByNumber[rec.number]) {
                recommendationsByNumber[rec.number] = [];
            }
            recommendationsByNumber[rec.number].push(rec);
        });

        // 2. 각 그룹 내에서 duration 순으로 정렬
        const sortedGroups = Object.keys(recommendationsByNumber)
            .map(Number)
            .sort((a, b) => b - a) // number가 큰 순서로 정렬 (참여 인원 많은 순)
            .map((number) => {
                const group = recommendationsByNumber[number];
                // 각 그룹 내에서 duration이 긴 순으로 정렬
                group.sort((a, b) => {
                    if (b.duration !== a.duration) {
                        return b.duration - a.duration; // duration 긴 순
                    }
                    // duration이 같으면 count로 보조 정렬
                    if (b.count !== a.count) {
                        return b.count - a.count;
                    }
                    // 그 다음은 날짜/시간 순
                    if (a.date !== b.date) {
                        return a.date.localeCompare(b.date);
                    }
                    return a.start_time - b.start_time;
                });
                return { number, recommendations: group };
            });

        // 3. 스마트한 8개 제한 로직
        let finalRecommendations = [];
        let totalCount = 0;

        for (const group of sortedGroups) {
            const groupSize = group.recommendations.length;

            // 현재까지의 추천 + 이 그룹을 모두 포함했을 때의 총개수
            const potentialTotal = totalCount + groupSize;

            if (potentialTotal <= 8) {
                // 8개 이하면 그룹 전체 추가
                finalRecommendations.push(...group.recommendations);
                totalCount = potentialTotal;
            } else if (totalCount === 0) {
                // 첫 번째 그룹인데 8개를 초과하는 경우, 8개까지만 추가
                finalRecommendations.push(...group.recommendations.slice(0, 8));
                totalCount = 8;
                break;
            } else {
                // 이미 일부 추천이 있고, 이 그룹을 추가하면 8개를 초과하는 경우
                // 현재 그룹을 포함하지 않고 종료 (그룹이 잘리는 것을 방지)
                break;
            }

            // 정확히 8개에 도달하면 종료
            if (totalCount === 8) {
                break;
            }
        }

        // 인원수별로 그룹화된 데이터도 반환 (기존 호환성 유지)
        const finalRecommendationsByNumber = {};
        finalRecommendations.forEach((rec) => {
            if (!finalRecommendationsByNumber[rec.number]) {
                finalRecommendationsByNumber[rec.number] = [];
            }
            finalRecommendationsByNumber[rec.number].push(rec);
        });

        return {
            success: true,
            message: "추천 시간을 성공적으로 조회했습니다.",
            data: {
                recommendations: finalRecommendations,
                recommendationsByNumber: finalRecommendationsByNumber,
                totalRecommendations: finalRecommendations.length,
                originalTotalRecommendations: enrichedData.length,
                groupInfo: sortedGroups.map((g) => ({
                    number: g.number,
                    count: g.recommendations.length,
                })),
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "추천 시간 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 특정 인원수 이상의 추천 시간 조회
 * @param {string} meetingId - 미팅 ID
 * @param {number} minParticipants - 최소 참여 인원
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getRecommendationsByMinParticipants(
    meetingId,
    minParticipants
) {
    try {
        const { data, error } = await supabase
            .from("recommendation")
            .select("*")
            .eq("meeting_id", meetingId)
            .gte("number", minParticipants)
            .order("number", { ascending: false })
            .order("duration", { ascending: false })
            .order("date")
            .order("start_time");

        if (error) {
            console.error(
                "Error fetching recommendations by min participants:",
                error
            );
            throw error;
        }

        return {
            success: true,
            message: `${minParticipants}명 이상 참여 가능한 추천 시간을 조회했습니다.`,
            data: {
                recommendations: data,
                minParticipants,
                totalRecommendations: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "추천 시간 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}
