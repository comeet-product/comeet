'use client';

import { useEffect, useState, use } from 'react';
import { getMeeting } from '@/lib/supabase/getMeeting';
import Title from "@/components/Title";
import TimetableComponent from "@/components/TimetableComponent/TimetableComponent";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";
import UserBar from "@/components/UserBar";

export default function MeetingPage({ params }) {
    const [meeting, setMeeting] = useState(null);
    const unwrappedParams = use(params);

    useEffect(() => {
        getMeeting(unwrappedParams.id).then(setMeeting);
    }, [unwrappedParams.id]);

    if (!meeting) return null;

    return (
        <div className="w-full">
            <div className="mb-10">
                <Title>{meeting.title}</Title>
            </div>
            <div className="mb-10">
                <AvailableDatesGroup />
            </div>
                <h5 className="text-md text-gray-500 text-center font-semibold mb-1">
                    Schedule Overview
                </h5>
            <div className="mb-4">
                {/* 나중에 여기는 TimetableResult로 바꿔야함 */}
                <TimetableComponent
                dayCount={7}
                halfCount={24}
                startDate={"05/21"}
                startTime={10}
                dateHeaderHeight={23}
                hasDateHeaderAbove={false}
                />
            </div>
            <div>
                <UserBar />
            </div>
        </div>
    );
}