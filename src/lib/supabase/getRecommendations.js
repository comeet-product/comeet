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
 * @returns {string} 포맷된 시간 문자열 ("1.5시간", "2시간", "4시간+" 등)
 */
function formatDurationHours(hours) {
    if (hours >= 4.5) {
        return "4시간+";
    } else if (hours === Math.floor(hours)) {
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
            .eq("meeting_id", meetingId)
            .order("number", { ascending: false })
            .order("duration", { ascending: false })
            .order("date")
            .order("start_time");

        if (error) {
            console.error("Error fetching recommendations:", error);
            throw error;
        }

        // Duration을 시간으로 변환하고 members를 배열로 파싱
        const enrichedData = data.map((rec) => {
            let parsedMembers = [];
            
            // members가 JSON 문자열인 경우 파싱
            if (typeof rec.members === 'string') {
                try {
                    parsedMembers = JSON.parse(rec.members);
                } catch (parseError) {
                    console.error('Error parsing members JSON:', parseError, 'for record:', rec);
                    parsedMembers = [];
                }
            } else if (Array.isArray(rec.members)) {
                // 이미 배열인 경우 그대로 사용
                parsedMembers = rec.members;
            }

            return {
                ...rec,
                members: parsedMembers, // 파싱된 배열로 교체
                durationInHours: convertDurationToHours(rec.duration),
                durationFormatted: formatDurationHours(
                    convertDurationToHours(rec.duration)
                ),
            };
        });

        // 인원수별로 그룹화
        const recommendationsByNumber = {};
        enrichedData.forEach((rec) => {
            if (!recommendationsByNumber[rec.number]) {
                recommendationsByNumber[rec.number] = [];
            }
            recommendationsByNumber[rec.number].push(rec);
        });

        return {
            success: true,
            message: "추천 시간을 성공적으로 조회했습니다.",
            data: {
                recommendations: enrichedData,
                recommendationsByNumber: recommendationsByNumber,
                totalRecommendations: enrichedData.length,
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

        // members를 배열로 파싱
        const enrichedData = data.map((rec) => {
            let parsedMembers = [];
            
            // members가 JSON 문자열인 경우 파싱
            if (typeof rec.members === 'string') {
                try {
                    parsedMembers = JSON.parse(rec.members);
                } catch (parseError) {
                    console.error('Error parsing members JSON:', parseError, 'for record:', rec);
                    parsedMembers = [];
                }
            } else if (Array.isArray(rec.members)) {
                // 이미 배열인 경우 그대로 사용
                parsedMembers = rec.members;
            }

            return {
                ...rec,
                members: parsedMembers, // 파싱된 배열로 교체
            };
        });

        return {
            success: true,
            message: `${minParticipants}명 이상 참여 가능한 추천 시간을 조회했습니다.`,
            data: {
                recommendations: enrichedData,
                minParticipants,
                totalRecommendations: enrichedData.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "추천 시간 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}
 