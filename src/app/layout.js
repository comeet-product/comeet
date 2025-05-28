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
          <div className="w-full mx-5 lg:max-w-sm lg:mx-auto my-5 bg-white lg:border lg:border-gray-300 lg:rounded-lg p-5">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}