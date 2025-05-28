export function getTimeSlots(start, end, interval = 30) {
    const slots = [];
    let hour = Math.floor(start / 100);
    let minute = start % 100;

    const limitHour = Math.floor((end + interval) / 100);
    const limitMinute = (end + interval) % 100;

    while (hour < limitHour || (hour === limitHour && minute < limitMinute)) {
        const time = hour * 100 + minute;
        if (time > end) break;
        slots.push(time);

        minute += interval;
        if (minute >= 60) {
            hour += Math.floor(minute / 60);
            minute = minute % 60;
        }
    }

    return slots;
}
