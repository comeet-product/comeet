import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 텍스트 - Coming Soon 스타일 */}
                <div className="mb-4">
                    <h1
                        className="text-6xl md:text-7xl font-light text-gray-800 tracking-wider"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                            transform: "rotate(-2deg)",
                        }}
                    >
                        404..
                    </h1>
                </div>

                {/* not found 텍스트 */}
                <div className="mb-8">
                    <h2
                        className="text-3xl md:text-4xl font-light text-gray-700 tracking-wide"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                            transform: "rotate(1deg)",
                        }}
                    >
                        not found
                    </h2>
                </div>

                {/* 고양이 이미지 */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        {/* 실제 이미지로 교체될 부분 */}
                        <img
                            src="/images/cat-404.png"
                            alt="404 고양이"
                            className="w-64 h-64 object-cover rounded-lg shadow-lg"
                            style={{
                                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
                                transform: "rotate(-1deg)",
                            }}
                            onError={(e) => {
                                // 이미지가 없을 경우 플레이스홀더 표시
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />

                        {/* 이미지 로드 실패 시 플레이스홀더 */}
                        <div
                            className="w-64 h-64 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center"
                            style={{
                                display: "none",
                                transform: "rotate(-1deg)",
                            }}
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-2">🐱</div>
                                <p className="text-gray-500 text-sm">
                                    이미지를 추가해주세요
                                    <br />
                                    <code>public/images/cat-404.png</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메시지 */}
                <div className="mb-8">
                    <p
                        className="text-gray-600 text-lg leading-relaxed"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                        }}
                    >
                        이 고양이처럼 페이지도
                        <br />
                        어디론가 숨어버렸나봐요 🙈
                    </p>
                </div>

                {/* 액션 버튼들 */}
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                            fontSize: "16px",
                        }}
                    >
                        🏠 집으로 돌아가기
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-105"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                            fontSize: "16px",
                        }}
                    >
                        ⬅️ 뒤로 가기
                    </button>
                </div>

                {/* comeet 로고/브랜딩 */}
                <div className="mt-12">
                    <Link href="/" className="inline-block">
                        <div
                            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300"
                            style={{
                                fontFamily:
                                    "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                                transform: "rotate(-1deg)",
                            }}
                        >
                            co<span className="text-blue-600">meet</span>
                        </div>
                    </Link>
                </div>

                {/* 숨겨진 이스터에그 */}
                <div className="mt-8 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <p
                        className="text-xs text-gray-400"
                        style={{
                            fontFamily:
                                "'Comic Sans MS', 'Marker Felt', 'Kristen ITC', cursive",
                        }}
                    >
                        💡 팁: 고양이를 찾으면 행운이 온다고 해요!
                    </p>
                </div>
            </div>
        </div>
    );
}
