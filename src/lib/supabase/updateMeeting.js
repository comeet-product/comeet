"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅 제목 업데이트
 * @param {string} meetingId - 미팅 ID
 * @param {string} newTitle - 새로운 제목
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function updateMeetingTitle(meetingId, newTitle) {
    try {
        const { data, error } = await supabase
            .from("meeting")
            .update({ title: newTitle })
            .eq("meetingid", meetingId)
            .select();

        if (error) {
            console.error("Error updating meeting title:", error);
            throw error;
        }

        return {
            success: true,
            message: "제목이 성공적으로 업데이트되었습니다.",
            data: data[0],
        };
    } catch (error) {
        return {
            success: false,
            message: "제목 업데이트 중 오류가 발생했습니다: " + error.message,
        };
    }
}
