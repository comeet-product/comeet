'use client';

import { supabase } from "../supabase.js";

/**
 * 새로운 미팅 생성
 * @param {Object} meetingData - 미팅 데이터
 * @param {string} meetingData.title - 미팅 제목
 * @param {string[]} meetingData.dates - 가능한 날짜 배열
 * @param {Object} meetingData.selectableTime - 선택 가능한 시간 설정
 * @param {number} meetingData.selectableTime.start - 시작 시간 (예: 900)
 * @param {number} meetingData.selectableTime.end - 종료 시간 (예: 1800)
 * @param {number} meetingData.selectableTime.interval - 시간 간격 (분)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function createMeeting(meetingData) {
    try {
        const meetingId = Math.random().toString(36).substr(2, 9);
        const now = new Date();
        const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9

        // 1. meetings 테이블에 미팅 생성
        const { data: meeting, error: meetingError } = await supabase
            .from("meetings")
            .insert([
                {
                    meeting_id: meetingId,
                    title: meetingData.title,
                    dates: meetingData.dates,
                    selectable_time: meetingData.selectableTime,
                    recommendations: [],
                    created_at: kstDate.toISOString(),
                },
            ])
            .select();

        if (meetingError) {
            console.error("Error creating meeting:", meetingError);
            throw meetingError;
        }

        // 2. availabilities 테이블에 빈 participants 배열로 초기화
        const { error: availabilityError } = await supabase
            .from("availabilities")
            .insert([
                {
                    meeting_id: meetingId,
                    participants: [],
                    created_at: kstDate.toISOString(),
                    updated_at: kstDate.toISOString(),
                },
            ]);

        if (availabilityError) {
            console.error(
                "Error initializing availabilities:",
                availabilityError
            );
            throw availabilityError;
        }

        return {
            success: true,
            message: "미팅이 성공적으로 생성되었습니다.",
            data: meeting[0],
        };
    } catch (error) {
        return {
            success: false,
            message: "미팅 생성 중 오류가 발생했습니다: " + error.message,
        };
    }
}
