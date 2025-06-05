import React from "react";
import AvailableDate from "./AvailableDate";

export default function AvailableDates({
    memberCount = 4,
    availableDates = [
        { date: "5월 30일", time: "4시간+", opacity: 1 },
        { date: "5월 20일", time: "2시간", opacity: 0.8 },
        { date: "5월 21일", time: "1시간", opacity: 0.7 },
        { date: "5월 19일", time: "30분", opacity: 0.6 },
    ],
}) {
    return (
        <div className="w-full">
            <h2 className="text-base font-medium text-gray-900">
                {memberCount}명이 모두 가능한 날짜
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {availableDates.map((item, index) => (
                    <AvailableDate
                        key={index}
                        date={item.date}
                        timeText={item.time}
                        backgroundColor={`rgba(54, 116, 181, ${item.opacity})`}
                    />
                ))}
            </div>
        </div>
    );
}
