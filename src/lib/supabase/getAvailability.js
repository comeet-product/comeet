"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅의 모든 가용성 데이터 조회
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getAvailability(meetingId) {
    try {
        const { data, error } = await supabase
            .from("availability")
            .select(
                `
                date,
                times,
                user:user_id (
                    userid,
                    name,
                    meetingid
                )
            `
            )
            .eq("user.meetingid", meetingId)
            .order("date")
            .order("user.name");

        if (error) {
            console.error("Error fetching availability:", error);
            throw error;
        }

        // 사용자별로 그룹화
        const availabilityByUser = {};
        const availabilityByDate = {};

        data.forEach((record) => {
            const userId = record.user.userid;
            const userName = record.user.name;
            const date = record.date;

            // 사용자별 그룹화
            if (!availabilityByUser[userId]) {
                availabilityByUser[userId] = {
                    userid: userId,
                    name: userName,
                    availability: {},
                };
            }
            availabilityByUser[userId].availability[date] = record.times;

            // 날짜별 그룹화
            if (!availabilityByDate[date]) {
                availabilityByDate[date] = [];
            }
            availabilityByDate[date].push({
                userid: userId,
                name: userName,
                times: record.times,
            });
        });

        return {
            success: true,
            message: "가용성 데이터를 성공적으로 조회했습니다.",
            data: {
                availability: data,
                availabilityByUser,
                availabilityByDate,
                totalRecords: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                "가용성 데이터 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 특정 사용자의 가용성 데이터 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUserAvailability(userId) {
    try {
        const { data, error } = await supabase
            .from("availability")
            .select(
                `
                date,
                times,
                user:user_id (
                    userid,
                    name,
                    meetingid
                )
            `
            )
            .eq("user_id", userId)
            .order("date");

        if (error) {
            console.error("Error fetching user availability:", error);
            throw error;
        }

        // 날짜별 가용성 맵 생성
        const availabilityMap = {};
        data.forEach((record) => {
            availabilityMap[record.date] = record.times;
        });

        return {
            success: true,
            message: "사용자 가용성 데이터를 성공적으로 조회했습니다.",
            data: {
                userid: userId,
                name: data.length > 0 ? data[0].user.name : null,
                availability: data,
                availabilityMap,
                totalDates: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                "사용자 가용성 데이터 조회 중 오류가 발생했습니다: " +
                error.message,
        };
    }
}

/**
 * 특정 날짜의 모든 사용자 가용성 조회
 * @param {string} meetingId - 미팅 ID
 * @param {string} date - 날짜 (예: "2024-12-20")
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getAvailabilityByDate(meetingId, date) {
    try {
        const { data, error } = await supabase
            .from("availability")
            .select(
                `
                times,
                user:user_id (
                    userid,
                    name,
                    meetingid
                )
            `
            )
            .eq("user.meetingid", meetingId)
            .eq("date", date)
            .order("user.name");

        if (error) {
            console.error("Error fetching availability by date:", error);
            throw error;
        }

        return {
            success: true,
            message: "날짜별 가용성 데이터를 성공적으로 조회했습니다.",
            data: {
                date,
                availability: data.map((record) => ({
                    userid: record.user.userid,
                    name: record.user.name,
                    times: record.times,
                })),
                totalUsers: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                "날짜별 가용성 데이터 조회 중 오류가 발생했습니다: " +
                error.message,
        };
    }
}
