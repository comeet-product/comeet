"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 텍스트 */}
                <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>

                {/* not found 텍스트 */}
                <h2 className="text-2xl text-gray-600 mb-8">
                    페이지를 찾을 수 없습니다
                </h2>

                {/* 고양이 이미지 */}
                <div className="mb-8 flex justify-center">
                    <img
                        src="/images/cat-404.png"
                        alt="404 고양이"
                        className="w-64 h-64 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                            // 이미지가 없을 경우 이모지 표시
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                        }}
                    />
                    <div
                        className="w-64 h-64 flex items-center justify-center text-8xl"
                        style={{ display: "none" }}
                    >
                        🐱
                    </div>
                </div>

                {/* 홈으로 돌아가기 버튼 */}
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
