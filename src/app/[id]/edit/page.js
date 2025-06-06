"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import TimetableSelect from "@/components/TimetableComponent/TimetableSelect";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function EditPage({ params }) {
    const [name, setName] = useState('');
    const router = useRouter();
    const unwrappedParams = use(params);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            // 여기서 실제 저장 로직 처리
            console.log('저장된 이름:', name.trim());
            console.log('미팅 ID:', unwrappedParams.id);
            
            // 저장 후 메인 페이지로 돌아가기
            router.push(`/${unwrappedParams.id}`);
        }
    };

    const handleBack = () => {
        router.push(`/${unwrappedParams.id}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0">
                <div className="px-10 py-8 flex flex-col gap-4">
                    <Title link={false} editable={false}>새로운 회의</Title>
                    <div className="w-full flex-1 min-h-0">
                        <TimetableSelect />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 px-10 pb-8">
                <form onSubmit={handleSubmit} className="flex justify-between gap-2 w-full">
                    <div className="flex-1">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            onCheckDuplicate={() => false}
                        />
                    </div>
                    <Button 
                        size="small"
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="whitespace-nowrap"
                    >
                        저장
                    </Button>
                </form>
            </div>
        </div>
    );
} 