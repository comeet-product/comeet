export const dummyMeetingData = {
    title: "프론트-백엔드 통합 테스트",
    dates: ["2025-07-05", "2025-07-06"],
    selectableTime: {
        startTime: 900,
        endTime: 1800,
    },
    recommendations: {
        "2025-07-05": {
            availableTime: [
                {
                    startTime: 900,
                    length: 2,
                    count: 3,
                    availableUsers: [
                        { user: "예진" },
                        { user: "재완" },
                        { user: "기훈" },
                    ],
                },
                
            ],
        },
        "2025-07-06": {
            availableTime: [
                {
                    startTime: 1330,
                    length: 2,
                    count: 2,
                    availableUsers: [{ user: "예진" }, { user: "재완" }],
                },

            ],
        },
    },
};
