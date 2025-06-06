// TimetableResult의 수정된 시간 계산 로직 테스트

function getMeetingTimeInfo(
    meeting,
    defaultStartTime = 10,
    defaultHalfCount = 8
) {
    if (!meeting?.selectable_time) {
        return {
            startTime: defaultStartTime,
            halfCount: defaultHalfCount,
        };
    }

    const startHHMM = meeting.selectable_time.start || 900;
    const endHHMM = meeting.selectable_time.end || 1700;

    const startHour = Math.floor(startHHMM / 100);
    const startMinute = startHHMM % 100;

    const endHour = Math.floor(endHHMM / 100);
    const endMinute = endHHMM % 100;

    const startTimeInHalfHours = startHour * 2 + (startMinute >= 30 ? 1 : 0);
    const endTimeInHalfHours = endHour * 2 + (endMinute >= 30 ? 1 : 0);

    const displayStartTime = startTimeInHalfHours / 2;
    const totalHalfHours = endTimeInHalfHours - startTimeInHalfHours;

    return {
        startTime: displayStartTime,
        halfCount: totalHalfHours,
    };
}

function timeToHalfIndex(time, dynamicStartTime) {
    if (typeof time === "string") {
        const [hour, minute] = time.split(":").map(Number);
        const startHour = Math.floor(dynamicStartTime);
        const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const currentTimeInMinutes = hour * 60 + minute;
        return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
    } else {
        const hour = Math.floor(time / 100);
        const minute = time % 100;
        const startHour = Math.floor(dynamicStartTime);
        const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const currentTimeInMinutes = hour * 60 + minute;
        return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
    }
}

// 테스트 케이스
const testCases = [
    { start: 930, end: 1700, desc: "9:30 ~ 17:00" },
    { start: 900, end: 1700, desc: "9:00 ~ 17:00" },
];

console.log("TimetableResult 시간 계산 테스트:");
console.log("=====================================");

testCases.forEach((testCase) => {
    const meeting = { selectable_time: testCase };
    const result = getMeetingTimeInfo(meeting);

    console.log(`${testCase.desc}`);
    console.log(
        `  => startTime: ${result.startTime}, halfCount: ${result.halfCount}`
    );

    // timeToHalfIndex 테스트
    const testTimes = ["10:00", "10:30", "11:00", 1000, 1030, 1100];
    console.log("  시간 변환 테스트:");
    testTimes.forEach((time) => {
        const halfIndex = timeToHalfIndex(time, result.startTime);
        console.log(`    ${time} => halfIndex: ${halfIndex}`);
    });
    console.log("");
});
