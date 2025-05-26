import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * 추천 시간대 계산 및 저장
 * @param {string} meetingId
 */

export async function calculateRecommendations(meetingId) {
    const availRef = collection(db, "meetings", meetingId, "availabilities");
    const snapshot = await getDocs(availRef);

    const userResponses = [];
    snapshot.forEach((doc) => {
        userResponses.push({ id: doc.id, ...doc.data() });
    });

    // 1. 모든 날짜 + 시간 슬롯별 가능한 사용자 정리
    const timeMap = {}; // { "2025-07-05": { 900: [user], 930: [user] } }

    for (const { name, availableSlots } of userResponses) {
        for (const date in availableSlots) {
            if (!timeMap[date]) timeMap[date] = {};
            for (const time of availableSlots[date]) {
                if (!timeMap[date][time]) timeMap[date][time] = [];
                timeMap[date][time].push(name);
            }
        }
    }

    // 2. 연속 시간 블록 계산 
    const recommendations = {};
    for (const date in timeMap) {
        const slots = Object.keys(timeMap[date])
            .map(Number)
            .sort((a, b) => a - b);

        const blocks = [];
        let i = 0;

        while (i < slots.length) {
            const start = slots[i];
            const currentUsers = timeMap[date][start];
            let length = 1;

            while (
                i + length < slots.length &&
                slots[i + length] === slots[i] + length * 30 &&
                arrayEqual(timeMap[date][slots[i + length]], currentUsers)
            ) {
                length++;
            }

            blocks.push({
                startTime: start,
                length,
                count: currentUsers.length,
                availableUsers: currentUsers.map((user) => ({ user })),
            });

            i += length;
        }

        recommendations[date] = { availableTime: blocks };
    }

    // 3. Firestore에 저장
    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, { recommendations });

    console.log(`추천 시간 계산 완료 for ${meetingId}`);
}

// 배열 비교용임
function arrayEqual(a, b) {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((x) => b.includes(x))
    );
}
