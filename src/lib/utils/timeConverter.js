/**
 * 시간 데이터 변환 유틸리티
 */

/**
 * 분 단위 시간을 시간으로 변환
 * @param {number} timeInMinutes - 분 단위 시간 (예: 900 = 9시 00분)
 * @returns {number} 시간 (예: 9)
 */
export const convertMinutesToHour = (timeInMinutes) => {
    return Math.floor(timeInMinutes / 100);
};

/**
 * selectableTime 객체를 TimeHeader에서 사용할 수 있는 형태로 변환
 * @param {Object} selectableTime - { start: 900, end: 1800, interval: 30 }
 * @returns {Object} { startHour: 9, hourCount: 10 }
 */
export const convertSelectableTimeToTimeHeader = (selectableTime) => {
    const { start, end } = selectableTime;

    const startHour = convertMinutesToHour(start);
    const endHour = convertMinutesToHour(end);
    const hourCount = endHour - startHour + 1;

    return {
        startHour,
        hourCount,
    };
};

/**
 * getMeeting 결과에서 TimeHeader용 데이터 추출
 * @param {Object} meetingData - getMeeting의 결과 데이터
 * @returns {Object} { startHour: 9, hourCount: 10 }
 */
export const extractTimeHeaderData = (meetingData) => {
    if (!meetingData || !meetingData.selectable_time) {
        return { startHour: 9, hourCount: 10 }; // 기본값 (9AM-6PM)
    }

    return convertSelectableTimeToTimeHeader(meetingData.selectable_time);
};
 