import Time from "./Time";

export default function TimeHeader({ halfCount, startTime, dateHeaderHeight }) {
    const hourCount = Math.floor(halfCount / 2);
    const hasExtraHalf = halfCount % 2 === 1;
    const halfHeight = 17;
    const hourHeight = halfHeight * 2; // 34px

    // Time 컴포넌트는 Hour 개수보다 1개 더 많아야 함
    const timeCount = hourCount + 1;

    // 30분 단위 시간 생성 함수
    const generateTimeLabels = (start, count) => {
        const times = [];

        // 시작 시간을 30분 단위로 처리 (9.5 = 9시 30분)
        const startHour = Math.floor(start);
        const startHasHalf = start % 1 >= 0.5;

        // 첫 번째 라벨 시간 계산
        // 9.5 (9:30) 시작이면 첫 라벨은 10시부터
        // 9.0 (9:00) 시작이면 첫 라벨은 9시부터
        const firstLabelHour = startHasHalf ? startHour + 1 : startHour;

        for (let i = 0; i < count; i++) {
            const currentHour = firstLabelHour + i;

            const displayHour =
                currentHour > 12 ? currentHour - 12 : currentHour;
            const period = currentHour >= 12 ? "PM" : "AM";
            const formattedHour = displayHour === 0 ? 12 : displayHour;

            times.push(`${formattedHour} ${period}`);
        }
        return times;
    };

    const timeLabels = generateTimeLabels(startTime, timeCount);

    return (
        <div
            className="relative flex justify-end"
            style={{
                width: "fit-content",
                height: `${dateHeaderHeight + halfCount * halfHeight}px`,
            }}
        >
            {/* DateHeader 높이만큼 빈 공간 */}
            <div style={{ height: `${dateHeaderHeight}px` }}></div>

            {/* Time 컴포넌트들 - Hour의 위아래 border line에 위치 */}
            {timeLabels.map((time, index) => {
                // 30분 시작의 경우 첫 번째 라벨 위치 조정
                const startHasHalf = startTime % 1 >= 0.5;
                const baseOffset = startHasHalf ? halfHeight : 0; // 30분 시작이면 halfHeight(17px)만큼 아래로
                const topPosition =
                    dateHeaderHeight + baseOffset + index * hourHeight;

                return (
                    <div
                        key={`time-${index}`}
                        className="absolute w-fit"
                        style={{
                            top: `${topPosition}px`,
                            transform: "translateY(-50%)", // Time을 border line 중앙에 위치
                        }}
                    >
                        <Time time={time} />
                    </div>
                );
            })}
        </div>
    );
}
