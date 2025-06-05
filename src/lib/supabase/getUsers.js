"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅 참여자 목록 조회
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUsers(meetingId) {
    try {
        const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("meetingid", meetingId)
            .order("name");

        if (error) {
            console.error("Error fetching users:", error);
            throw error;
        }

        return {
            success: true,
            message: "참여자 목록을 성공적으로 조회했습니다.",
            data: {
                users: data,
                totalUsers: data.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message:
                "참여자 목록 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 특정 사용자 정보 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUser(userId) {
    try {
        const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("userid", userId)
            .single();

        if (error) {
            console.error("Error fetching user:", error);
            throw error;
        }

        return {
            success: true,
            message: "사용자 정보를 성공적으로 조회했습니다.",
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            message:
                "사용자 정보 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 사용자명으로 사용자 조회
 * @param {string} meetingId - 미팅 ID
 * @param {string} name - 사용자 이름
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function getUserByName(meetingId, name) {
    try {
        const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("meetingid", meetingId)
            .eq("name", name)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No rows returned
                return {
                    success: false,
                    message: "해당 이름의 사용자를 찾을 수 없습니다.",
                };
            }
            console.error("Error fetching user by name:", error);
            throw error;
        }

        return {
            success: true,
            message: "사용자를 성공적으로 찾았습니다.",
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            message: "사용자 조회 중 오류가 발생했습니다: " + error.message,
        };
    }
}
