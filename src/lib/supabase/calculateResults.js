"use client";

import { supabase } from "../supabase.js";

/**
 * 미팅의 결과 데이터 계산 및 저장 (각 시간대별 참여 가능 인원)
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function calculateResults(meetingId) {
    try {
        console.log('Calculating results for meeting:', meetingId);

        // 1. 미팅의 selectable_time 정보 가져오기
        const { data: meetingData, error: meetingError } = await supabase
            .from("meeting")
            .select("selectable_time")
            .eq("meetingid", meetingId)
            .single();

        if (meetingError) {
            console.error("Error fetching meeting data:", meetingError);
            throw meetingError;
        }

        console.log('Meeting data:', meetingData);

        // 2. 가용성 데이터 가져오기 (user 테이블과 조인)
        const { data: availabilityData, error: fetchError } = await supabase
            .from("availability")
            .select(
                `
                date,
                times,
                user:user_id (
                    name,
                    meetingid
                )
            `
            )
            .eq("user.meetingid", meetingId);

        if (fetchError) {
            console.error("Error fetching availability data:", fetchError);
            throw fetchError;
        }

        console.log('Availability data:', availabilityData);

        if (!availabilityData || availabilityData.length === 0) {
            console.log('No availability data found');
            // 기존 result 데이터 삭제
            await supabase.from("result").delete().eq("meeting_id", meetingId);
            
            return {
                success: true,
                message: "가용성 데이터가 없습니다. 기존 결과를 정리했습니다.",
                data: { results: [] },
            };
        }

        // 3. 시간별 가용 사용자 맵 생성
        const timeMap = {};
        availabilityData.forEach((record) => {
            if (!record.user || !record.times || !Array.isArray(record.times)) {
                console.log('Skipping invalid record:', record);
                return;
            }

            const date = record.date;
            const userName = record.user.name;

            if (!timeMap[date]) {
                timeMap[date] = {};
            }

            record.times.forEach((time) => {
                if (typeof time !== "number" || isNaN(time)) {
                    console.log('Invalid time:', time);
                    return;
                }

                if (!timeMap[date][time]) {
                    timeMap[date][time] = [];
                }
                timeMap[date][time].push(userName);
            });
        });

        console.log('Time map:', timeMap);

        // 4. 모든 시간대별 결과 계산 (result 테이블용)
        const results = [];
        const { start, end, interval } = meetingData.selectable_time;

        // HHMM 형식(900 = 9:00)을 분 단위로 변환하는 함수
        const convertHHMMToMinutes = (hhmm) => {
            const hours = Math.floor(hhmm / 100);
            const minutes = hhmm % 100;
            return hours * 60 + minutes;
        };

        // 분 단위를 HHMM 형식으로 변환하는 함수
        const convertMinutesToHHMM = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours * 100 + mins;
        };

        // HHMM 형식을 분 단위로 변환
        const startMinutes = convertHHMMToMinutes(start);
        const endMinutes = convertHHMMToMinutes(end);

        console.log('Selectable time (converted):', { 
            startHHMM: start, 
            endHHMM: end, 
            interval,
            startMinutes,
            endMinutes
        });
        console.log('Available dates in timeMap:', Object.keys(timeMap));

        Object.entries(timeMap).forEach(([date, timeSlots]) => {
            console.log(`Processing date: ${date} with ${Object.keys(timeSlots).length} time slots`);
            
            // 모든 가능한 시간대에 대해 결과 생성 (HHMM 형식으로 처리)
            for (let timeMinutes = startMinutes; timeMinutes < endMinutes; timeMinutes += interval) {
                const timeHHMM = convertMinutesToHHMM(timeMinutes); // HHMM 형식으로 변환
                const members = timeSlots[timeHHMM] || []; // HHMM 형식으로 조회
                if (members.length > 0) { // 참여자가 있는 시간대만 저장
                    results.push({
                        meeting_id: meetingId,
                        date,
                        start_time: timeHHMM, // HHMM 형식으로 저장
                        members,
                        number: members.length,
                    });
                    console.log(`Added result: ${date} ${timeHHMM} (${Math.floor(timeMinutes/60)}:${String(timeMinutes%60).padStart(2,'0')}) with ${members.length} members`);
                }
            }
        });

        console.log('Calculated results:', results);

        // 5. 기존 result 데이터 삭제
        const { error: deleteError } = await supabase
            .from("result")
            .delete()
            .eq("meeting_id", meetingId);

        if (deleteError) {
            console.error("Error deleting old results:", deleteError);
            throw deleteError;
        }

        // 6. result 테이블에 저장
        if (results.length > 0) {
            const { error: resultError } = await supabase
                .from("result")
                .insert(results);

            if (resultError) {
                console.error("Error saving results:", resultError);
                throw resultError;
            }
        }

        console.log('Results saved successfully');

        return {
            success: true,
            message: "결과 데이터가 성공적으로 계산되었습니다.",
            data: {
                results: results,
                totalResults: results.length,
            },
        };
    } catch (error) {
        console.error("Error in calculateResults:", error);
        return {
            success: false,
            message: "결과 계산 중 오류가 발생했습니다: " + error.message,
        };
    }
} 