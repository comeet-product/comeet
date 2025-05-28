/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        main: "#3674B5",
        black: "#272727",
        white: "#f5f5f5",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontWeight: {
        'thin': '100',       // 가장 얇게
        'extralight': '200', // 매우 얇게
        'light': '300',      // 얇게
        'regular': '400',    // 기본 텍스트
        'medium': '500',     // 조금 굵게
        'semibold': '600',   // 제목용
        'bold': '700',       // 강조용
        'extrabold': '800',  // 매우 강조
      },
    },
  },
  plugins: [],
};
