"use client";

import { supabase } from "../supabase.js";

/**
 * 새로운 미팅 생성
 * @param {Object} meetingData - 미팅 데이터
 * @param {string} meetingData.title - 미팅 제목

 * @param {string[]} meetingData.dates - 가능한 날짜 배열 (예: ["2024-12-20", "2024-12-22", "2024-12-25"])

 * @param {Object} meetingData.selectableTime - 선택 가능한 시간 설정
 * @param {number} meetingData.selectableTime.start - 시작 시간 (예: 900)
 * @param {number} meetingData.selectableTime.end - 종료 시간 (예: 1800)
 * @param {number} meetingData.selectableTime.interval - 시간 간격 (분)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function createMeeting(meetingData) {
    try {

        // dates 배열 정렬 (오름차순)
        const sortedDates = [...meetingData.dates].sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });

        // meeting 테이블에 미팅 생성 (createdAt은 DEFAULT NOW()로 자동 설정)

        const { data: meeting, error: meetingError } = await supabase
            .from("meeting")
            .insert([
                {
                    title: meetingData.title,

                    dates: sortedDates,

                    selectable_time: meetingData.selectableTime,
                    // createdAt은 DEFAULT NOW()로 자동 설정되므로 생략
                },
            ])
            .select();

        if (meetingError) {
            console.error("Error creating meeting:", meetingError);
            throw meetingError;
        }

        return {
            success: true,
            message: "미팅이 성공적으로 생성되었습니다.",
            data: {
                meetingid: meeting[0].meetingid,
                title: meeting[0].title,
                dates: meeting[0].dates,
                selectable_time: meeting[0].selectable_time,
                createdAt: meeting[0].createdat, // Supabase는 소문자로 반환
            },
        };
    } catch (error) {
        console.error("Error in createMeeting:", error);
        return {
            success: false,
            message: "미팅 생성 중 오류가 발생했습니다: " + error.message,
        };
    }
}
