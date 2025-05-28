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
        <div className="w-[293px] h-[76px]">
            <h2 className="text-black text-[15px] font-medium">
                {memberCount}명이 모두 가능한 날짜
            </h2>
            <div className="mt-[5px] grid grid-cols-2 gap-x-[7px] gap-y-[6.6px]">
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
