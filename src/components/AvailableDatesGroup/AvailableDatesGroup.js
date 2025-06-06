"use client";

import React, { useState, useEffect } from "react";
import { getRecommendations } from "@/lib/supabase/getRecommendations";
import AvailableDates from "./AvailableDates";

export default function AvailableDatesGroup({ meetingId, refreshKey }) {
    const [recommendationsData, setRecommendationsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!meetingId) return;
            
            setLoading(true);
            try {
                const result = await getRecommendations(meetingId);
                if (result.success) {
                    // 인원수별로 그룹화된 데이터를 UI 형태로 변환
                    const groupData = Object.entries(result.data.recommendationsByNumber)
                        .map(([memberCount, recommendations]) => ({
                            memberCount: parseInt(memberCount),
                            availableDates: recommendations.map((rec) => {
                                // 날짜 포맷팅 (YYYY-MM-DD -> M월 D일)
                                const date = new Date(rec.date);
                                const month = date.getMonth() + 1;
                                const day = date.getDate();
                                const formattedDate = `${month}월 ${day}일`;
                                
                                // 시간 포맷팅
                                const durationText = rec.durationFormatted;
                                
                                // opacity 계산 (duration에 따라)
                                const opacity = Math.min(0.6 + (rec.duration / 8) * 0.4, 1);
                                
                                return {
                                    date: formattedDate,
                                    time: durationText,
                                    opacity: opacity,
                                };
                            }),
                        }))
                        .sort((a, b) => b.memberCount - a.memberCount); // 인원 많은 순으로 정렬
                    
                    setRecommendationsData(groupData);
                } else {
                    console.error('Failed to fetch recommendations:', result.message);
                    setRecommendationsData([]);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setRecommendationsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [meetingId, refreshKey]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="text-gray-500">추천 시간을 불러오는 중...</div>
            </div>
        );
    }

    if (recommendationsData.length === 0) {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="text-gray-500">추천 가능한 시간이 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-5">
            {recommendationsData.map((data, index) => (
                <AvailableDates
                    key={index}
                    memberCount={data.memberCount}
                    availableDates={data.availableDates}
                />
            ))}
        </div>
    );
}
