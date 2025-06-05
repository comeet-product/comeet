"use client";

import { useState } from "react";
import { createMeeting } from "@/lib/supabase/createMeeting";
import { submitAvailability } from "@/lib/supabase/submitAvailability";
import { calculateRecommendations } from "@/lib/supabase/calculateRecommendations";
import { getRecommendations } from "@/lib/supabase/getRecommendations";
import { getResults } from "@/lib/supabase/getResults";
import { getUsers } from "@/lib/supabase/getUsers";
import { getAvailability } from "@/lib/supabase/getAvailability";
import Button from "@/components/Button";

export default function TestPage() {
    const [testResults, setTestResults] = useState({
        createMeeting: null,
        submitAvailability: null,
        calculateRecommendations: null,
        getRecommendations: null,
        getResults: null,
        getUsers: null,
        getAvailability: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState("");
    const [meetingId, setMeetingId] = useState("");

    const handleTest = async () => {
        setIsLoading(true);
        try {
            // 1. 미팅 생성 테스트 (createdAt 포함)
            setCurrentStep("미팅 생성 중...");
            const meetingData = {
                title: "테스트 미팅 with Timestamp",
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

            const newMeetingId = meetingResult.data.meetingid;
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
                {
                    name: "이영희",
                    availableSlots: {
                        "2025-07-05": [900, 930, 1000, 1030],
                        "2025-07-06": [1400, 1430, 1500],
                    },
                },
            ];

            const submitResults = [];
            for (const response of testResponses) {
                const result = await submitAvailability(
                    newMeetingId,
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

            // 4. 추천 시간 조회 테스트
            setCurrentStep("추천 시간 조회 중...");
            const getRecommendationsResult = await getRecommendations(
                newMeetingId
            );
            setTestResults((prev) => ({
                ...prev,
                getRecommendations: getRecommendationsResult,
            }));

            // 5. 결과 조회 테스트
            setCurrentStep("결과 조회 중...");
            const getResultsResult = await getResults(newMeetingId);
            setTestResults((prev) => ({
                ...prev,
                getResults: getResultsResult,
            }));

            // 6. 사용자 목록 조회 테스트
            setCurrentStep("사용자 목록 조회 중...");
            const getUsersResult = await getUsers(newMeetingId);
            setTestResults((prev) => ({
                ...prev,
                getUsers: getUsersResult,
            }));

            // 7. 가용성 데이터 조회 테스트
            setCurrentStep("가용성 데이터 조회 중...");
            const getAvailabilityResult = await getAvailability(newMeetingId);
            setTestResults((prev) => ({
                ...prev,
                getAvailability: getAvailabilityResult,
            }));

            setCurrentStep("테스트 완료!");
        } catch (error) {
            console.error("Test failed:", error);
            setCurrentStep(`테스트 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTestResult = (result, title) => {
        if (!result) return null;

        return (
            <div className="border rounded p-4">
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <div
                    className={`p-2 rounded text-sm ${
                        result.success ||
                        (Array.isArray(result) &&
                            result.every((r) => r.success))
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                >
                    <p className="font-medium">
                        상태:{" "}
                        {result.success ||
                        (Array.isArray(result) &&
                            result.every((r) => r.success))
                            ? "성공"
                            : "실패"}
                    </p>
                    {result.message && <p>메시지: {result.message}</p>}
                    {Array.isArray(result) && (
                        <div className="mt-2">
                            {result.map((r, i) => (
                                <div key={i} className="mb-1">
                                    <span className="font-medium">
                                        항목 {i + 1}:
                                    </span>{" "}
                                    {r.success ? "성공" : "실패"} - {r.message}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* createdAt 필드 표시 */}
                    {result.data?.createdAt && (
                        <p className="mt-2 text-blue-600">
                            생성 시간:{" "}
                            {new Date(result.data.createdAt).toLocaleString(
                                "ko-KR"
                            )}
                        </p>
                    )}
                </div>
                <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                        상세 데이터 보기
                    </summary>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                새로운 테이블 구조 + Timestamp 테스트
            </h1>
            <Button
                text={isLoading ? currentStep : "전체 테스트 실행"}
                onClick={handleTest}
                disabled={isLoading}
            />

            {meetingId && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                    생성된 미팅 ID: {meetingId}
                </div>
            )}

            <div className="space-y-4">
                {renderTestResult(
                    testResults.createMeeting,
                    "1. 미팅 생성 (Timestamp 포함)"
                )}
                {renderTestResult(
                    testResults.submitAvailability,
                    "2. 가용성 제출"
                )}
                {renderTestResult(
                    testResults.calculateRecommendations,
                    "3. 추천 시간 계산"
                )}
                {renderTestResult(
                    testResults.getRecommendations,
                    "4. 추천 시간 조회"
                )}
                {renderTestResult(testResults.getResults, "5. 결과 조회")}
                {renderTestResult(testResults.getUsers, "6. 사용자 목록 조회")}
                {renderTestResult(
                    testResults.getAvailability,
                    "7. 가용성 데이터 조회"
                )}
            </div>
        </div>
    );
}
