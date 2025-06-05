"use client";

import { supabase } from "../supabase.js";
import { extractTimeHeaderData } from "../utils/timeConverter.js";

/**
 * 미팅 정보 조회
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function getMeeting(meetingId) {
    try {
        const { data, error } = await supabase
            .from("meeting")
            .select("*")
            .eq("meetingid", meetingId)
            .single();

        if (error) {
            throw error;
        }

        // TimeHeader에서 사용할 수 있는 형태로 시간 데이터 변환
        const timeHeaderData = extractTimeHeaderData(data);

        return {
            success: true,
            data: {
                ...data,
                timeHeaderData, // { startHour: 9, hourCount: 9 }
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "미팅 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}
