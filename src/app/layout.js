import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
    title: "Comeet",
    description: "모두가 되는 시간, 한눈에",
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
    <html lang="ko" className="h-full">
      <body className="antialiased bg-white h-full">
        <div className="h-full flex justify-center lg:py-4">
          <div className="w-screen lg:w-[25%] lg:mx-auto bg-white lg:border lg:border-gray-300 lg:rounded-lg flex flex-col relative">
            <div className="flex-1 flex flex-col mt-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-20">
              <Header />
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
