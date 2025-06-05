"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogoClick = () => {
        if (pathname === "/") {
            // 메인 페이지일 때는 새로고침
            window.location.reload();
        } else {
            // 다른 페이지일 때는 메인 페이지로 이동
            router.push("/");
        }
    };

    return (
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-300">
            <img
                src="/logo_text.png"
                className="w-[15%] min-w-[100px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                alt="logo"
                onClick={handleLogoClick}
            />
        </div>
    );
}
