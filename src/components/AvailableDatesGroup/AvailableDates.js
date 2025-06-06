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
    onRecommendationClick,
    selectedRecommendation
}) {
    return (
        <div className="w-full">
            <h2 className="text-base font-medium text-gray-900">
                {memberCount}명이 가능해요
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {availableDates.map((item, index) => {
                    // 현재 항목이 선택된 추천과 같은지 확인
                    const isSelected = selectedRecommendation && 
                        item.originalData && 
                        selectedRecommendation.date === item.originalData.date && 
                        selectedRecommendation.start_time === item.originalData.start_time;
                    
                    return (
                        <AvailableDate
                            key={index}
                            date={item.date}
                            timeText={item.time}
                            backgroundColor={`rgba(54, 116, 181, ${item.opacity})`}
                            onClick={() => onRecommendationClick && onRecommendationClick(item)}
                            isSelected={isSelected}
                        />
                    );
                })}
            </div>
        </div>
    );
}
