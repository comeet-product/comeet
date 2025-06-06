"use client";

import { supabase } from "../supabase.js";

/**
 * 특정 사용자의 가용성 데이터 가져오기
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUserAvailability(userId) {
    try {
        console.log('Fetching availability for user:', userId);

        const { data: availabilityData, error } = await supabase
            .from("availability")
            .select("date, times")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching user availability:", error);
            throw error;
        }

        console.log('User availability data:', availabilityData);

        // 날짜별 시간 슬롯 객체로 변환
        const availableSlots = {};
        availabilityData.forEach((record) => {
            if (record.date && Array.isArray(record.times)) {
                availableSlots[record.date] = record.times;
            }
        });

        return {
            success: true,
            message: "사용자 가용성 데이터를 성공적으로 가져왔습니다.",
            data: {
                availability: availableSlots,
            },
        };
    } catch (error) {
        console.error("Error in getUserAvailability:", error);
        return {
            success: false,
            message: "사용자 가용성 데이터 가져오기 중 오류가 발생했습니다: " + error.message,
        };
    }
} 