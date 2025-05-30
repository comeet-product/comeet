import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 사용자 응답 저장
 * @param {string} meetingId - 미팅 ID ("meeting_001")
 * @param {string} userId - 사용자 ID ("user_001")
 * @param {string} name - 사용자 이름
 * @param {Object} availableSlots - 날짜별 가능한 시간 슬롯 ({ "2025-07-05": [900, 930] })
 */
export async function submitAvailability(
    meetingId,
    userId,
    name,
    availableSlots
) {
    const ref = doc(db, "meetings", meetingId, "availabilities", userId);

    const data = {
        name,
        availableSlots,
        submittedAt: serverTimestamp(),
    };

    await setDoc(ref, data);
    console.log(`✅ ${name} 응답 저장 완료 (${userId})`);
}
