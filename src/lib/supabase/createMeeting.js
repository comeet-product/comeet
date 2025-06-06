"use client";

import { supabase } from "../supabase.js";

/**
 * 8자 랜덤 Meeting ID 생성 (Base62: 0-9, a-z, A-Z)
 * 62^8 = 약 218조 개의 조합으로 충돌 확률 매우 낮음
 * @returns {string} 8자 랜덤 문자열 (예: "k2J4h9X1")
 */
function generateMeetingId() {
    const chars =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Meeting ID 중복 확인
 * @param {string} meetingId - 확인할 meeting ID
 * @returns {Promise<boolean>} 중복이면 true, 사용 가능하면 false
 */
async function checkMeetingIdExists(meetingId) {
    const { data, error } = await supabase
        .from("meeting")
        .select("meetingid")
        .eq("meetingid", meetingId)
        .single();

    // 데이터가 있으면 중복, 없으면 사용 가능
    return data !== null;
}

/**
 * 중복되지 않는 고유한 Meeting ID 생성
 * @returns {Promise<string>} 고유한 8자 meeting ID
 */
async function generateUniqueMeetingId() {
    let meetingId;
    let attempts = 0;
    const maxAttempts = 10; // 최대 10번 시도

    do {
        meetingId = generateMeetingId();
        attempts++;

        if (attempts >= maxAttempts) {
            throw new Error("고유한 Meeting ID 생성에 실패했습니다.");
        }
    } while (await checkMeetingIdExists(meetingId));

    return meetingId;
}

/**
 * 새로운 미팅 생성
 * @param {Object} meetingData - 미팅 데이터
 * @param {string} meetingData.title - 미팅 제목
 * @param {string[]} meetingData.dates - 가능한 날짜 배열 (사용하지 않음, 호환성을 위해 유지)
 * @param {Object} meetingData.selectableTime - 선택 가능한 시간 설정
 * @param {number} meetingData.selectableTime.start - 시작 시간 (예: 900)
 * @param {number} meetingData.selectableTime.end - 종료 시간 (예: 1800)
 * @param {number} meetingData.selectableTime.interval - 시간 간격 (분)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function createMeeting(meetingData) {
    try {
        // 고유한 8자 랜덤 Meeting ID 생성
        const meetingId = await generateUniqueMeetingId();

        console.log("Generated Meeting ID:", meetingId);

        // meeting 테이블에 미팅 생성 (custom meetingid 사용)
        const { data: meeting, error: meetingError } = await supabase
            .from("meeting")
            .insert([
                {
                    meetingid: meetingId,
                    title: meetingData.title,
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
                selectable_time: meeting[0].selectable_time,
                createdAt: meeting[0].createdat, // Supabase는 소문자로 반환
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "미팅 생성 중 오류가 발생했습니다: " + error.message,
        };
    }
}
