"use client";

import { supabase } from "../supabase.js";

/**
 * HHMM 형식 시간에 분을 더하는 함수
 * @param {number} time - HHMM 형식의 시간 (예: 1630)
 * @param {number} minutes - 더할 분 (예: 30)
 * @returns {number} 계산된 HHMM 형식 시간
 */
function addMinutesToTime(time, minutes) {
    const hours = Math.floor(time / 100);
    const mins = time % 100;
    
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    
    return newHours * 100 + newMins;
}

/**
 * 연속된 시간 블록을 찾아 추천 시간 생성
 * @param {Object} timeMap - 날짜별 시간대별 사용자 맵
 * @returns {Array} 추천 시간 배열
 */
function calculateContinuousBlocks(timeMap) {
    const recommendations = [];

    console.log('=== calculateContinuousBlocks NEW ALGORITHM ===');
    console.log('timeMap:', timeMap);

    Object.entries(timeMap).forEach(([date, timeSlots]) => {
        console.log(`\n--- Processing date: ${date} ---`);
        console.log('timeSlots:', timeSlots);
        
        // 시간대별로 정렬
        const sortedTimes = Object.keys(timeSlots)
            .map(Number)
            .sort((a, b) => a - b);

        console.log('sortedTimes:', sortedTimes);

        // 각 시간 슬롯에 대해 멤버 구성과 함께 저장
        const timeSlotData = sortedTimes.map(time => ({
            time: time,
            members: timeSlots[time].sort(), // 정렬해서 비교하기 쉽게
            memberKey: timeSlots[time].sort().join(',') // 멤버 구성을 키로 사용
        }));

        console.log('timeSlotData:', timeSlotData);

        // 연속되는 같은 멤버 구성의 블록들을 찾기
        let i = 0;
        while (i < timeSlotData.length) {
            const startSlot = timeSlotData[i];
            let duration = 1;
            let j = i + 1;

            console.log(`\n🔍 Starting from time ${startSlot.time} with members:`, startSlot.members);
            console.log(`   Member key: "${startSlot.memberKey}"`);
            console.log(`   Current index i=${i}, checking from j=${j}`);

            // 연속되는 시간 슬롯들 중에서 같은 멤버 구성인 것들 찾기
            while (j < timeSlotData.length) {
                const currentSlot = timeSlotData[j];
                const expectedTime = addMinutesToTime(startSlot.time, duration * 30);
                
                console.log(`  📋 Checking slot ${j}: time ${currentSlot.time}, expected ${expectedTime}`);
                console.log(`     Current members: "${currentSlot.memberKey}"`);
                console.log(`     Start members: "${startSlot.memberKey}"`);
                console.log(`     Members match: ${currentSlot.memberKey === startSlot.memberKey}`);
                console.log(`     Time match: ${currentSlot.time === expectedTime}`);
                
                // 시간이 연속이고 멤버 구성이 같은지 확인
                if (currentSlot.time === expectedTime && currentSlot.memberKey === startSlot.memberKey) {
                    duration++;
                    console.log(`  ✅ Continuous block extended to duration ${duration}`);
                    j++;
                } else {
                    if (currentSlot.time !== expectedTime) {
                        console.log(`  ❌ Time not continuous: ${currentSlot.time} !== ${expectedTime}`);
                    }
                    if (currentSlot.memberKey !== startSlot.memberKey) {
                        console.log(`  ❌ Members different: "${currentSlot.memberKey}" !== "${startSlot.memberKey}"`);
                    }
                    console.log(`  ⏹️ Block ended`);
                    break;
                }
            }

            // 추천에 추가 (최소 1명 이상의 멤버가 있어야 함)
            if (startSlot.members.length > 0) {
                const recommendation = {
                    date,
                    start_time: startSlot.time,
                    duration: duration,
                    members: startSlot.members,
                    number: startSlot.members.length,
                };
                console.log(`🎯 Adding recommendation:`, recommendation);
                console.log(`   Duration: ${duration}, Members: ${startSlot.members.length} people`);
                recommendations.push(recommendation);
            }

            // 다음 블록으로 이동 (현재 블록의 끝 다음부터)
            const nextI = Math.max(i + 1, j);
            console.log(`🔄 Moving to next block: from i=${i} to i=${nextI}`);
            i = nextI;
        }
    });

    console.log('\n=== Final recommendations ===');
    console.log(recommendations);

    // 참여 인원 수와 지속 시간으로 정렬 (인원 많고, 시간 긴 순)
    return recommendations.sort((a, b) => {
        if (b.number !== a.number) return b.number - a.number;
        return b.duration - a.duration;
    });
}

/**
 * 미팅 추천 시간 계산 및 저장
 * @param {string} meetingId - 미팅 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function calculateRecommendations(meetingId) {
    try {
        console.log('Starting calculateRecommendations for meetingId:', meetingId);
        
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

        console.log('Meeting data fetched:', meetingData);

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

        console.log('Availability data fetched:', availabilityData?.length, 'records');

        if (!availabilityData || availabilityData.length === 0) {
            console.log('No availability data found');
            return {
                success: true,
                message: "가용성 데이터가 없습니다.",
                data: { recommendations: [] },
            };
        }

        // 3. 시간별 가용 사용자 맵 생성
        const timeMap = {};
        availabilityData.forEach((record) => {
            if (!record.user || !record.times || !Array.isArray(record.times))
                return;

            const date = record.date;
            const userName = record.user.name;

            if (!timeMap[date]) {
                timeMap[date] = {};
            }

            record.times.forEach((time) => {
                if (typeof time !== "number" || isNaN(time)) return;

                if (!timeMap[date][time]) {
                    timeMap[date][time] = [];
                }
                timeMap[date][time].push(userName);
            });
        });

        console.log('TimeMap created with', Object.keys(timeMap).length, 'dates');

        // 4. 연속된 시간 블록 계산 (추천 시간)
        const recommendations = calculateContinuousBlocks(timeMap);
        console.log('Calculated recommendations:', recommendations.length, 'items');

        // 5. recommendation 테이블에 저장 (안전한 upsert 방식)
        
        // 먼저 기존 데이터 삭제
        console.log('Deleting existing recommendations...');
        const { error: deleteError } = await supabase
            .from("recommendation")
            .delete()
            .eq("meeting_id", meetingId);

        if (deleteError) {
            console.error("Error deleting existing recommendations:", deleteError);
            throw deleteError;
        }

        if (recommendations.length > 0) {
            const recommendationData = recommendations
                .slice(0, 8)
                .map((rec, index) => ({
                    meeting_id: meetingId,
                    date: rec.date,
                    start_time: rec.start_time,
                    duration: rec.duration,
                    members: rec.members, // PostgreSQL 배열로 직접 전달
                    number: rec.number,
                }));

            console.log('Inserting recommendation data:', recommendationData);
            
            // 새 데이터 삽입
            const { data: insertedData, error: recError } = await supabase
                .from("recommendation")
                .insert(recommendationData)
                .select(); // 삽입된 데이터를 반환받음

            if (recError) {
                console.error("Error saving recommendations - Full error object:", JSON.stringify(recError, null, 2));
                console.error("Error saving recommendations - Error code:", recError.code);
                console.error("Error saving recommendations - Error message:", recError.message);
                console.error("Error saving recommendations - Error details:", recError.details);
                console.error("Error saving recommendations - Error hint:", recError.hint);
                throw recError;
            }

            console.log('Successfully inserted recommendations:', insertedData?.length, 'records');
        } else {
            console.log('No recommendations to save');
        }

        return {
            success: true,
            message: "추천 시간이 성공적으로 계산되었습니다.",
            data: {
                recommendations: recommendations.slice(0, 8),
            },
        };
    } catch (error) {
        console.error("Error in calculateRecommendations - Full error:", JSON.stringify(error, null, 2));
        console.error("Error in calculateRecommendations - Error message:", error.message);
        console.error("Error in calculateRecommendations - Error stack:", error.stack);
        
        return {
            success: false,
            message: "추천 시간 계산 중 오류가 발생했습니다: " + (error.message || JSON.stringify(error)),
        };
    }
}
