// src/lib/test/runTestFlow.js
import { createMeeting } from "../firestore/createMeeting";
import { submitAvailability } from "../firestore/submitAvailability";
import { calculateRecommendations } from "../firestore/calculateRecommendations";

export async function runTestFlow() {
    const meetingId = "meeting_test_001";

    // Step 1: 미팅 생성
    await createMeeting(meetingId, {
        title: "프론트-백엔드 통합 테스트",
        dates: ["2025-07-05", "2025-07-06"],
        startTime: 900,
        endTime: 1800,
    });

    // Step 2: 사용자 응답 (여러 명)
    await submitAvailability(meetingId, "user_001", "재완", {
        "2025-07-05": [900, 930, 1000, 1030, 1100],
        "2025-07-06": [1330, 1400, 1430],
    });

    await submitAvailability(meetingId, "user_002", "기훈", {
        "2025-07-05": [930, 1000, 1030, 1100],
        "2025-07-06": [1400, 1430],
    });

    await submitAvailability(meetingId, "user_003", "예진", {
        "2025-07-05": [1000, 1030, 1100],
        "2025-07-06": [1330, 1400, 1430],
    });

    // Step 3: 추천 계산
    await calculateRecommendations(meetingId);

    console.log("✅ 전체 테스트 흐름 완료!");
}
