import React from "react";
import AvailableDates from "./AvailableDates";

export default function AvailableDatesGroup() {
    const groupData = [
        {
            memberCount: 4,
            availableDates: [
                { date: "5월 30일", time: "4시간+", opacity: 1 },
                { date: "5월 20일", time: "2시간", opacity: 0.8 },
                { date: "5월 21일", time: "1시간", opacity: 0.7 },
                { date: "5월 19일", time: "30분", opacity: 0.6 },
            ],
        },
        {
            memberCount: 3,
            availableDates: [
                { date: "5월 30일", time: "4시간+", opacity: 1 },
                { date: "5월 20일", time: "2시간", opacity: 0.8 },
                { date: "5월 21일", time: "1시간", opacity: 0.7 },
                { date: "5월 19일", time: "30분", opacity: 0.6 },
            ],
        },
    ];

    return (
        <div className="flex flex-col space-y-5">
            {groupData.map((data, index) => (
                <AvailableDates
                    key={index}
                    memberCount={data.memberCount}
                    availableDates={data.availableDates}
                />
            ))}
        </div>
    );
}
