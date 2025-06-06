"use client";

import { CheckCircle } from "lucide-react";

export default function ComeetMobile() {
    return (
        <div className="min-h-screen bg-white max-w-[375px] mx-auto relative">
            {/* Header */}

            {/* Hero Section */}
            <section className="px-6 py-8 bg-gradient-to-br from-[#3674B5]/5 to-[#3674B5]/10">
                <div className="space-y-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            모두가 되는 시간,
                            <br />
                            한눈에
                        </h1>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            복잡한 일정 조율은 이제 그만! COMEET으로 간단하게
                            모든 참석자가 가능한 시간을 찾아보세요. 몇 번의
                            클릭만으로 완벽한 약속 시간을 정할 수 있습니다.
                        </p>
                    </div>

                    {/* 결과화면 Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-500">
                                    결과화면
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 장점 */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-gray-600">
                                    회원가입 불필요
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-gray-600">완전 무료</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-sm text-gray-600">
                                    즉시 사용 가능
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3단계 섹션 */}
            <section className="px-6 py-8 pb-24">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            3단계로 완성하는 미팅 일정
                        </h2>
                    </div>

                    {/* 1단계 - 미팅 생성 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                1
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                미팅 생성
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            미팅 제목을 입력하고 원하는 약속 날짜와 시간대를
                            선택하여 미팅을 생성하세요.
                        </p>

                        {/* Create 화면 Placeholder */}
                        <div className="ml-11">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-gray-500">
                                            Create 화면
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2단계 - 시간 선택 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                2
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                시간 선택
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            가능한 시간을 클릭하거나 드래그 하세요.
                        </p>

                        {/* SelectTime 화면 Placeholder */}
                        <div className="ml-11">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-gray-500">
                                            SelectTime 화면
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3단계 - 링크 공유 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                3
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                링크 공유
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 ml-11">
                            링크를 참석자들에게 공유하세요.
                        </p>

                        {/* 링크 공유 화면 Placeholder */}
                        <div className="ml-11">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-gray-500">
                                            링크 공유 화면
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            링크가 복사되었습니다. Toast
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="px-6 py-8 pb-10 bg-gradient-to-br from-[#3674B5]/5 to-[#3674B5]/10">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                        지금 바로 간편하고 빠르게
                        <br />
                        약속 시간을 정해보세요!
                    </h2>
                </div>
            </section>

            {/* Feedback Section */}
            <section className="px-6 py-8 bg-gray-100 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    서비스 개선을 위한 의견을 보내주세요!
                </h2>
                <button
                    className="bg-[#3674B5] hover:bg-[#3674B5]/90 text-white font-semibold rounded-lg px-6 py-3"
                    onClick={() =>
                        window.open("https://tally.so/r/mZLO9A", "_blank")
                    }
                >
                    의견 보내기
                </button>
            </section>

            {/* Simple Footer */}
            <footer className="bg-gray-50 py-6 px-6 pb-32">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <img
                            src="/logo_text.png"
                            alt="COMEET Logo"
                            className="h-6 w-auto"
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} COMEET. All rights
                        reserved.
                    </p>
                </div>
            </footer>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4">
                <div className="max-w-[375px] mx-auto border-t border-gray-200 pt-4">
                    <div className="flex justify-center">
                        <button
                            className="bg-[#3674B5] hover:bg-[#3674B5]/90 text-white font-semibold rounded-lg"
                            style={{ width: "313px", height: "59px" }}
                        >
                            시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
