"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅의 모든 시간대별 결과 조회
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getResults(meetingId) {
    try {
        const { data, error } = await supabase
            .from("result")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("date")
            .order("start_time");

        if (error) {
            console.error("Error fetching results:", error);
            throw error;
        }

        // 날짜별로 그룹화
        const resultsByDate = {};
        data.forEach((result) => {
            if (!resultsByDate[result.date]) {
                resultsByDate[result.date] = [];
            }
            resultsByDate[result.date].push(result);
        });

        return {
            success: true,
            message: "결과를 성공적으로 조회했습니다.",
            data: {
                results: data,
                resultsByDate,
                totalTimeSlots: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "결과 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 특정 날짜의 시간대별 결과 조회
 * @param {string} meetingId - 미팅 ID
 * @param {string} date - 날짜 (예: "2024-12-20")
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getResultsByDate(meetingId, date) {
    try {
        const { data, error } = await supabase
            .from("result")
            .select("*")
            .eq("meeting_id", meetingId)
            .eq("date", date)
            .order("start_time");

        if (error) {
            console.error("Error fetching results by date:", error);
            throw error;
        }

        return {
            success: true,
            message: "날짜별 결과를 성공적으로 조회했습니다.",
            data: {
                date,
                results: data,
                totalTimeSlots: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                "날짜별 결과 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}
