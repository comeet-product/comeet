export function getTimeSlots(start, end, interval = 30) {
    const slots = [];
    let hour = Math.floor(start / 100);
    let minute = start % 100;

    while (true) {
        const currentTime = hour * 100 + minute;

        // 다음 슬롯 시간 계산
        let nextMinute = minute + interval;
        let nextHour = hour;
        if (nextMinute >= 60) {
            nextHour += Math.floor(nextMinute / 60);
            nextMinute = nextMinute % 60;
        }
        const nextTime = nextHour * 100 + nextMinute;

        // 다음 시간이 end를 넘으면 중단
        if (nextTime > end) {
            break;
        }

        slots.push(currentTime);

        hour = nextHour;
        minute = nextMinute;
    }

    return slots;
}
