import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
    title: "Comeet",
    description: "모임 관리 앱",
    metadataBase: new URL('https://comeet.team'),
    openGraph: {
        images: ["/comeet_logo.png"],
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-white">
        <div className="min-h-screen flex justify-center">
          <div className="w-full lg:max-w-sm lg:mx-auto bg-white lg:border lg:border-gray-300 lg:rounded-lg">
            <div className="top-0">
              <Header />
            </div>
            <div className="m-5">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
