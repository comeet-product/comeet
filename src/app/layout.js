import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
    title: "Comeet",
    description: "모임 관리 앱",
    metadataBase: new URL('https://comeet.team'),
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        images: ["/comeet_logo.png"],
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-white">
        <div className="min-h-screen flex justify-center lg:py-8">
          <div className="w-screen lg:w-full lg:max-w-sm lg:mx-auto bg-white lg:border lg:border-gray-300 lg:rounded-lg flex flex-col overflow-y-auto">
            <Header />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
