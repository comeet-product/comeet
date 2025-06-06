"use client";

import { supabase } from "../supabase.js";
import { calculateResults } from "./calculateResults.js";

/**
 * 사용자 이름 중복 체크
 * @param {string} meetingId - 미팅 ID
 * @param {string} name - 사용자 이름
 * @returns {Promise<boolean>} 중복 여부 (true: 중복됨, false: 중복되지 않음)
 */
async function checkDuplicateName(meetingId, name) {
    const { data, error } = await supabase
        .from("user")
        .select("name")
        .eq("meetingid", meetingId)
        .eq("name", name);

    if (error) {
        console.error("Error checking duplicate name:", error);
        throw error;
    }

    return data && data.length > 0;
}

/**
 * 사용자 응답 저장
 * @param {string} meetingId - 미팅 ID
 * @param {string} name - 사용자 이름
 * @param {Object} availableSlots - 날짜별 가능한 시간 슬롯 {"2024-12-20": [900, 930, 1000], "2024-12-21": [1400, 1430]}
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function submitAvailability(meetingId, name, availableSlots) {
    try {
        console.log('Submitting availability:', { meetingId, name, availableSlots });

        // 1. 이름 중복 체크
        const isDuplicate = await checkDuplicateName(meetingId, name);
        if (isDuplicate) {
            return {
                success: false,
                message: "이미 존재하는 이름입니다. 다른 이름을 사용해주세요.",
            };
        }

        // 2. user 테이블에 사용자 생성
        const { data: userData, error: userError } = await supabase
            .from("user")
            .insert([
                {
                    meetingid: meetingId,
                    name: name,
                },
            ])
            .select();

        if (userError) {
            console.error("Error creating user:", userError);
            throw userError;
        }

        const userId = userData[0].userid;
        console.log('User created with ID:', userId);

        // 3. availability 테이블에 날짜별 가용성 저장
        const availabilityInsertData = [];
        Object.entries(availableSlots).forEach(([date, times]) => {
            if (Array.isArray(times) && times.length > 0) {
                availabilityInsertData.push({
                    user_id: userId,
                    date: date,
                    times: times,
                });
            }
        });

        if (availabilityInsertData.length > 0) {
            const { error: availabilityError } = await supabase
                .from("availability")
                .insert(availabilityInsertData);

            if (availabilityError) {
                console.error("Error saving availability:", availabilityError);
                throw availabilityError;
            }
        }

        console.log('Availability saved successfully');

        // 4. 결과 데이터 재계산
        console.log('Recalculating results...');
        const resultsResult = await calculateResults(meetingId);
        
        if (!resultsResult.success) {
            console.error('Failed to recalculate results:', resultsResult.message);
            // 결과 계산 실패해도 사용자 추가는 성공으로 처리
        } else {
            console.log('Results recalculated successfully');
        }

        return {
            success: true,
            message: "가용성이 성공적으로 저장되었습니다.",
            data: {
                userid: userId,
                name: name,
                availableSlots: availableSlots,
                resultsCalculated: resultsResult.success,
            },
        };
    } catch (error) {
        console.error("Error in submitAvailability:", error);
        return {
            success: false,
            message: "가용성 저장 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 사용자 응답 수정
 * @param {string} userId - 사용자 ID
 * @param {Object} availableSlots - 새로운 가용성 데이터
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function updateAvailability(userId, availableSlots) {
    try {
        // 1. 기존 availability 데이터 삭제
        const { error: deleteError } = await supabase
            .from("availability")
            .delete()
            .eq("user_id", userId);

        if (deleteError) {
            console.error("Error deleting old availability:", deleteError);
            throw deleteError;
        }

        // 2. 새로운 availability 데이터 삽입
        const availabilityInsertData = [];
        Object.entries(availableSlots).forEach(([date, times]) => {
            if (Array.isArray(times) && times.length > 0) {
                availabilityInsertData.push({
                    user_id: userId,
                    date: date,
                    times: times,
                });
            }
        });

        if (availabilityInsertData.length > 0) {
            const { error: insertError } = await supabase
                .from("availability")
                .insert(availabilityInsertData);

            if (insertError) {
                console.error("Error inserting new availability:", insertError);
                throw insertError;
            }
        }

        return {
            success: true,
            message: "가용성이 성공적으로 수정되었습니다.",
            data: {
                userid: userId,
                availableSlots: availableSlots,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "가용성 수정 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 사용자 이름 업데이트
 * @param {string} userId - 사용자 ID
 * @param {string} meetingId - 미팅 ID
 * @param {string} newName - 새로운 이름
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function updateUserName(userId, meetingId, newName) {
    try {
        // 1. 이름 중복 체크 (자신 제외)
        const { data: duplicateData, error: duplicateError } = await supabase
            .from("user")
            .select("name")
            .eq("meetingid", meetingId)
            .eq("name", newName)
            .neq("userid", userId);

        if (duplicateError) {
            console.error("Error checking duplicate name:", duplicateError);
            throw duplicateError;
        }

        if (duplicateData && duplicateData.length > 0) {
            return {
                success: false,
                message: "이미 존재하는 이름입니다. 다른 이름을 사용해주세요.",
            };
        }

        // 2. 사용자 이름 업데이트
        const { data, error } = await supabase
            .from("user")
            .update({ name: newName })
            .eq("userid", userId)
            .select();

        if (error) {
            console.error("Error updating user name:", error);
            throw error;
        }

        return {
            success: true,
            message: "사용자 이름이 성공적으로 업데이트되었습니다.",
            data: data[0],
        };
    } catch (error) {
        console.error("Error in updateUserName:", error);
        return {
            success: false,
            message: "사용자 이름 업데이트 중 오류가 발생했습니다: " + error.message,
        };
    }
}

/**
 * 사용자 응답 및 이름 수정
 * @param {string} userId - 사용자 ID
 * @param {string} meetingId - 미팅 ID
 * @param {string} newName - 새로운 이름
 * @param {Object} availableSlots - 새로운 가용성 데이터
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function updateUserAvailability(userId, meetingId, newName, availableSlots) {
    try {
        // 1. 사용자 이름 업데이트
        const nameResult = await updateUserName(userId, meetingId, newName);
        if (!nameResult.success) {
            return nameResult;
        }

        // 2. 가용성 데이터 업데이트
        const availabilityResult = await updateAvailability(userId, availableSlots);
        if (!availabilityResult.success) {
            return availabilityResult;
        }

        // 3. 결과 데이터 재계산
        console.log('Recalculating results after user update...');
        const resultsResult = await calculateResults(meetingId);
        
        if (!resultsResult.success) {
            console.error('Failed to recalculate results:', resultsResult.message);
            // 결과 계산 실패해도 사용자 업데이트는 성공으로 처리
        } else {
            console.log('Results recalculated successfully after user update');
        }

        return {
            success: true,
            message: "사용자 정보가 성공적으로 수정되었습니다.",
            data: {
                userid: userId,
                name: newName,
                availableSlots: availableSlots,
                resultsCalculated: resultsResult.success,
            },
        };
    } catch (error) {
        console.error("Error in updateUserAvailability:", error);
        return {
            success: false,
            message: "사용자 정보 수정 중 오류가 발생했습니다: " + error.message,
        };
    }
}
