import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
/**
 * Create a new meeting in Firestore
 * @param {string} meetingId - Document ID (ex. "meeting_001")
 * @param {{
 *   title: string,
 *   dates: string[], // ex: ["2025-07-05", "2025-07-06"]
 *   startTime: string, // ex: "0900"
 *   endTime: string // ex: "1800"
 * }} params
 */
export async function createMeeting(
    meetingId,
    { title, dates, startTime, endTime }
) {
    const meetingRef = doc(db, "meetings", meetingId);

    const data = {
        title,
        dates, // ex: ["2025-07-05", "2025-07-06"]
        selectableTime: {
            startTime: 900, 
            endTime: 1800, 
        },
        recommendations: {}, 
    };

    await setDoc(meetingRef, data);
    console.log(`미팅 생성 완료: ${meetingId}`);

}
