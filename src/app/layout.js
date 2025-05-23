import "./globals.css";

export const metadata = {
  title: "Comeet",
  description: "모임 관리 앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-white">
        <div className="min-h-screen flex justify-center">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-sm xl:max-w-sm mx-auto my-5 bg-white border border-gray-300 rounded-lg">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}