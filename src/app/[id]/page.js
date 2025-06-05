"use client";

import { useEffect, useState, use } from "react";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { updateMeetingTitle } from "@/lib/supabase/updateMeeting";
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

    const handleTitleChange = async (newTitle) => {
        const result = await updateMeetingTitle(unwrappedParams.id, newTitle);
        if (result.success) {
            setMeeting(prev => ({ ...prev, title: newTitle }));
        } else {
            alert(result.message);
        }
    };

    if (!meeting) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 px-10 py-8 flex flex-col gap-4">
                <Title onChange={handleTitleChange}>{meeting.title}</Title>
                <div className="mb-10">
                <AvailableDatesGroup />
                </div>
                    <h5 className="text-md text-gray-500 text-center font-semibold mb-1">
                        Schedule Overview
                    </h5>
                <TimetableComponent
                    dayCount={7}
                    halfCount={8}
                    startDate="05/19"
                    startTime={10}
                    dateHeaderHeight={23}
                />
            </div>
            <UserBar />
        </div>
    );
}
