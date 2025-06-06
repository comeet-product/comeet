"use client";

import React, { useState, useEffect } from "react";
import { getRecommendations } from "@/lib/supabase/getRecommendations";
import AvailableDates from "./AvailableDates";

export default function AvailableDatesGroup({ meetingId, refreshKey, onRecommendationClick }) {
    const [recommendationsData, setRecommendationsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!meetingId) return;
            
            setLoading(true);
            try {
                const result = await getRecommendations(meetingId);
                console.log('Recommendations result:', result); // 디버깅용
                
                if (result.success) {
                    console.log('Recommendations data:', result.data); // 디버깅용
                    console.log('RecommendationsByNumber:', result.data.recommendationsByNumber); // 디버깅용
                    
                    // 인원수별로 그룹화된 데이터를 UI 형태로 변환
                    const groupData = Object.entries(result.data.recommendationsByNumber || {})
                        .map(([memberCount, recommendations]) => {
                            console.log(`Processing group ${memberCount}:`, recommendations); // 디버깅용
                            
                            return {
                                memberCount: parseInt(memberCount),
                                availableDates: (recommendations || []).map((rec, index) => {
                                    console.log(`Processing recommendation ${index}:`, rec); // 디버깅용
                                    
                                    // 날짜 포맷팅 (YYYY-MM-DD -> M월 D일) - 안전성 추가
                                    let formattedDate = '날짜 미정';
                                    if (rec.date) {
                                        try {
                                            const date = new Date(rec.date);
                                            if (!isNaN(date.getTime())) {
                                                const month = date.getMonth() + 1;
                                                const day = date.getDate();
                                                formattedDate = `${month}월 ${day}일`;
                                            }
                                        } catch (error) {
                                            console.error('Date formatting error:', error, 'for date:', rec.date);
                                        }
                                    }
                                    
                                    // 시간 포맷팅 - 안전성 추가
                                    const durationText = rec.durationFormatted || '시간 미정';
                                    
                                    // opacity 계산 (duration에 따라) - 안전성 추가
                                    const duration = rec.duration || 1;
                                    const opacity = Math.min(0.6 + (duration / 8) * 0.4, 1);
                                    
                                    const result = {
                                        date: formattedDate,
                                        time: durationText,
                                        opacity: opacity,
                                        originalData: rec, // 원본 데이터 추가
                                    };
                                    
                                    console.log(`Formatted recommendation ${index}:`, result); // 디버깅용
                                    return result;
                                }),
                            };
                        })
                        .filter(group => group.availableDates.length > 0) // 빈 그룹 제거
                        .sort((a, b) => b.memberCount - a.memberCount); // 인원 많은 순으로 정렬
                    
                    console.log('Final group data:', groupData); // 디버깅용
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

    const handleRecommendationClick = (availableDate) => {
        if (onRecommendationClick && availableDate.originalData) {
            console.log('Recommendation clicked:', availableDate.originalData);
            onRecommendationClick(availableDate.originalData);
        }
    };

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
                    onRecommendationClick={handleRecommendationClick}
                />
            ))}
        </div>
    );
}
