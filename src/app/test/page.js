"use client";

import { useState } from "react";
import { createMeeting } from "@/lib/supabase/createMeeting";
import { submitAvailability } from "@/lib/supabase/submitAvailability";
import { calculateRecommendations } from "@/lib/supabase/calculateRecommendations";
import Button from "@/components/Button";

export default function TestPage() {
    const [testResults, setTestResults] = useState({
        createMeeting: null,
        submitAvailability: null,
        calculateRecommendations: null,
        additionalSubmit: null,
        additionalCalculate: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState("");
    const [meetingId, setMeetingId] = useState("");

    const handleTest = async () => {
        setIsLoading(true);
        try {
            // 1. 미팅 생성 테스트
            setCurrentStep("미팅 생성 중...");
            const meetingData = {
                title: "테스트 미팅",
                dates: ["2025-07-05", "2025-07-06"],
                selectableTime: {
                    start: 900,
                    end: 1800,
                    interval: 30,
                },
            };
            const meetingResult = await createMeeting(meetingData);
            setTestResults((prev) => ({
                ...prev,
                createMeeting: meetingResult,
            }));

            if (!meetingResult.success) {
                throw new Error(meetingResult.message);
            }

            const newMeetingId = meetingResult.data.meeting_id;
            setMeetingId(newMeetingId);

            // 2. 가용성 제출 테스트
            setCurrentStep("가용성 제출 중...");
            const testResponses = [
                {
                    name: "홍길동",
                    availableSlots: {
                        "2025-07-05": [900, 930, 1000],
                        "2025-07-06": [1400, 1430],
                    },
                },
                {
                    name: "김철수",
                    availableSlots: {
                        "2025-07-05": [900, 930],
                        "2025-07-06": [1400, 1430, 1500],
                    },
                },
            ];

            const submitResults = [];
            for (const response of testResponses) {
                const userId = `user_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                const result = await submitAvailability(
                    newMeetingId,
                    userId,
                    response.name,
                    response.availableSlots
                );
                submitResults.push(result);
            }
            setTestResults((prev) => ({
                ...prev,
                submitAvailability: submitResults,
            }));

            // 3. 추천 시간 계산 테스트
            setCurrentStep("추천 시간 계산 중...");
            const recommendationsResult = await calculateRecommendations(
                newMeetingId
            );
            setTestResults((prev) => ({
                ...prev,
                calculateRecommendations: recommendationsResult,
            }));

            // 4. 추가 사용자 가용성 제출 테스트
            setCurrentStep("추가 사용자 가용성 제출 중...");
            const additionalUser = {
                name: "이영희",
                availableSlots: {
                    "2025-07-05": [900, 930, 1000, 1030],
                    "2025-07-06": [1400, 1430, 1500],
                },
            };

            const additionalUserId = `user_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            const additionalResult = await submitAvailability(
                newMeetingId,
                additionalUserId,
                additionalUser.name,
                additionalUser.availableSlots
            );
            setTestResults((prev) => ({
                ...prev,
                additionalSubmit: additionalResult,
            }));

            // 5. 추가 사용자 포함 추천 시간 재계산
            setCurrentStep("추가 사용자 포함 추천 시간 계산 중...");
            const additionalRecommendationsResult =
                await calculateRecommendations(newMeetingId);
            setTestResults((prev) => ({
                ...prev,
                additionalCalculate: additionalRecommendationsResult,
            }));
        } catch (error) {
            console.error("테스트 실패:", error);
            setTestResults((prev) => ({
                ...prev,
                [currentStep]: {
                    success: false,
                    message: error.message,
                },
            }));
        }
        setIsLoading(false);
        setCurrentStep("");
    };

    const renderTestResult = (result, title) => {
        if (!result) return null;

        if (Array.isArray(result)) {
            return (
                <div className="space-y-2">
                    <h3 className="font-semibold">{title}</h3>
                    {result.map((r, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded ${
                                r.success ? "bg-green-50" : "bg-red-50"
                            }`}
                        >
                            <p className="text-sm">{r.message}</p>
                            {r.data && (
                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                                    {JSON.stringify(r.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div
                className={`p-4 rounded-lg ${
                    result.success ? "bg-green-100" : "bg-red-100"
                }`}
            >
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm">{result.message}</p>
                {result.data && (
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Supabase 연결 테스트</h1>
            <Button
                text={isLoading ? currentStep : "테스트 실행"}
                onClick={handleTest}
                disabled={isLoading}
            />

            {meetingId && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                    생성된 미팅 ID: {meetingId}
                </div>
            )}

            <div className="space-y-4">
                {renderTestResult(testResults.createMeeting, "1. 미팅 생성")}
                {renderTestResult(
                    testResults.submitAvailability,
                    "2. 가용성 제출"
                )}
                {renderTestResult(
                    testResults.calculateRecommendations,
                    "3. 추천 시간 계산"
                )}
                {renderTestResult(
                    testResults.additionalSubmit,
                    "4. 추가 사용자 가용성 제출"
                )}
                {renderTestResult(
                    testResults.additionalCalculate,
                    "5. 추가 사용자 포함 추천 시간 계산"
                )}
            </div>
        </div>
    );
}
