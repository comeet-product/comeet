import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 랜덤 미팅 ID 생성 (영문 대소문자 + 숫자)
 * @returns {string} 생성된 랜덤 ID
 */
function generateMeetingId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Create a new meeting in Firestore
 * @param {{
 *   title: string,
 *   dates: string[], // ex: ["2025-07-05", "2025-07-06"]
 *   startTime: number, // ex: 900
 *   endTime: number // ex: 1800
 * }} params
 * @returns {Promise<string>} 생성된 미팅 ID
 */
export async function createMeeting({ title, dates, startTime, endTime }) {
    const meetingId = generateMeetingId();
    const meetingRef = doc(db, "meetings", meetingId);

    const data = {
        title,
        dates, // ex: ["2025-07-05", "2025-07-06"]
        selectableTime: {
            startTime,
            endTime,
        },
        recommendations: {},
    };

    await setDoc(meetingRef, data);
    console.log(`미팅 생성 완료: ${meetingId}`);
    return meetingId;
}