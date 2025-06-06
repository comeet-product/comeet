import { supabase } from "../supabase.js";
import { createMeeting } from "./createMeeting.js";
import { submitAvailability } from "./submitAvailability.js";
import { calculateRecommendations } from "./calculateRecommendations.js";

/**
 * 테스트용 미팅 생성 및 응답 제출
 */
export async function runTestFlow() {
    try {
        // 1. 미팅 생성
        const meetingData = {
            title: "되면좋겟다",
            dates: ["2025-07-05", "2025-07-06"], // 호환성을 위해 유지
            selectableTime: {
                start: 900, // 9:00
                end: 1800, // 18:00
                interval: 30, // 30분
            },
        };

        const meetingResult = await createMeeting(meetingData);
        if (!meetingResult.success) {
            throw new Error(meetingResult.message);
        }

        const meetingId = meetingResult.data.meetingid;
        console.log("✅ 미팅 생성 완료:", meetingId);

        // 2. 테스트용 응답 데이터
        const testResponses = [
            {
                name: "김재완",
                availableSlots: {
                    "2025-07-05": [900, 930, 1000],
                    "2025-07-06": [1400, 1430],
                },
            },
            {
                name: "예지니",
                availableSlots: {
                    "2025-07-05": [900, 930, 1000],
                    "2025-07-06": [1400, 1430, 1500],
                },
            },
            {
                name: "기후니",
                availableSlots: {
                    "2025-07-05": [930, 1000],
                    "2025-07-06": [1430, 1500],
                },
            },
        ];

        // 3. 각 응답 제출
        for (const response of testResponses) {
            const result = await submitAvailability(
                meetingId,
                response.name,
                response.availableSlots,
                response.password || null // 테스트용 비밀번호 (선택사항)
            );

            if (!result.success) {
                console.error(`❌ ${response.name} 응답 실패:`, result.message);
                continue;
            }

            console.log(`✅ ${response.name} 응답 저장 완료`);
        }

        // 4. 추천 시간 계산
        const recommendationsResult = await calculateRecommendations(meetingId);
        if (!recommendationsResult.success) {
            throw new Error(recommendationsResult.message);
        }

        console.log("✅ 추천 시간 계산 완료:", recommendationsResult.data);

        return {
            success: true,
            message: "테스트 완료",
            data: {
                meetingId,
                recommendations: recommendationsResult.data,
            },
        };
    } catch (error) {
        console.error("❌ 테스트 실패:", error);
        return {
            success: false,
            message: "테스트 실패: " + error.message,
        };
    }
}
