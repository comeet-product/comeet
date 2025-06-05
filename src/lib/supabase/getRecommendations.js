"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅의 추천 시간 조회
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getRecommendations(meetingId) {
    try {
        const { data, error } = await supabase
            .from("recommendation")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("number", { ascending: false }) // 참여 인원 많은 순
            .order("duration", { ascending: false }) // 지속 시간 긴 순
            .order("date")
            .order("start_time");

        if (error) {
            console.error("Error fetching recommendations:", error);
            throw error;
        }

        // 인원수별로 그룹화
        const recommendationsByNumber = {};
        data.forEach((rec) => {
            if (!recommendationsByNumber[rec.number]) {
                recommendationsByNumber[rec.number] = [];
            }
            recommendationsByNumber[rec.number].push(rec);
        });

        return {
            success: true,
            message: "추천 시간을 성공적으로 조회했습니다.",
            data: {
                recommendations: data,
                recommendationsByNumber,
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
