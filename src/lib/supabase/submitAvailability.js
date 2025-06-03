'use client';

import { supabase } from "../supabase.js";

/**
 * 사용자 이름 중복 체크
 * @param {string} meetingId - 미팅 ID
 * @param {string} name - 사용자 이름
 * @returns {Promise<boolean>} 중복 여부 (true: 중복됨, false: 중복되지 않음)
 */
async function checkDuplicateName(meetingId, name) {
    const { data, error } = await supabase
        .from("availabilities")
        .select("participants")
        .eq("meeting_id", meetingId)
        .single();

    if (error) {
        console.error("Error checking duplicate name:", error);
        throw error;
    }

    return data.participants.some((p) => p.name === name);
}

/**
 * 사용자 응답 저장
 * @param {string} meetingId - 미팅 ID
 * @param {string} userId - 사용자 ID
 * @param {string} name - 사용자 이름
 * @param {Object} availableSlots - 날짜별 가능한 시간 슬롯
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function submitAvailability(
    meetingId,
    userId,
    name,
    availableSlots
) {
    try {
        // 1. 이름 중복 체크
        const isDuplicate = await checkDuplicateName(meetingId, name);
        if (isDuplicate) {
            return {
                success: false,
                message: "이미 존재하는 이름입니다. 다른 이름을 사용해주세요.",
            };
        }

        // 2. 현재 participants 배열 가져오기
        const { data: currentData, error: fetchError } = await supabase
            .from("availabilities")
            .select("participants")
            .eq("meeting_id", meetingId)
            .single();

        if (fetchError) {
            console.error("Error fetching current participants:", fetchError);
            throw fetchError;
        }

        // 3. 새로운 참가자 추가
        const now = new Date();
        const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
        const newParticipant = {
            user_id: userId,
            name,
            available_slots: availableSlots,
            submitted_at: kstDate.toISOString(),
        };

        const updatedParticipants = [
            ...currentData.participants,
            newParticipant,
        ];

        // 4. participants 배열 업데이트
        const { error: updateError } = await supabase
            .from("availabilities")
            .update({
                participants: updatedParticipants,
                updated_at: kstDate.toISOString(),
            })
            .eq("meeting_id", meetingId);

        if (updateError) {
            console.error("Error updating participants:", updateError);
            throw updateError;
        }

        return {
            success: true,
            message: "가용성이 성공적으로 저장되었습니다.",
            data: newParticipant,
        };
    } catch (error) {
        return {
            success: false,
            message: "가용성 저장 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 사용자 응답 수정
 * @param {string} meetingId - 미팅 ID
 * @param {string} userId - 사용자 ID
 * @param {Object} availableSlots - 새로운 가용성 데이터
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function updateAvailability(meetingId, userId, availableSlots) {
    try {
        // 1. 현재 participants 배열 가져오기
        const { data: currentData, error: fetchError } = await supabase
            .from("availabilities")
            .select("participants")
            .eq("meeting_id", meetingId)
            .single();

        if (fetchError) {
            console.error("Error fetching current participants:", fetchError);
            throw fetchError;
        }

        // 2. 해당 사용자의 데이터 업데이트
        const now = new Date();
        const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
        const updatedParticipants = currentData.participants.map(
            (participant) => {
                if (participant.user_id === userId) {
                    return {
                        ...participant,
                        available_slots: availableSlots,
                        submitted_at: kstDate.toISOString(),
                    };
                }
                return participant;
            }
        );

        // 3. participants 배열 업데이트
        const { error: updateError } = await supabase
            .from("availabilities")
            .update({
                participants: updatedParticipants,
                updated_at: kstDate.toISOString(),
            })
            .eq("meeting_id", meetingId);

        if (updateError) {
            console.error("Error updating participants:", updateError);
            throw updateError;
        }

        return {
            success: true,
            message: "가용성이 성공적으로 수정되었습니다.",
            data: updatedParticipants.find((p) => p.user_id === userId),
        };
    } catch (error) {
        return {
            success: false,
            message: "가용성 수정 중 오류가 발생했습니다: " + error.message,
        };
    }
}
