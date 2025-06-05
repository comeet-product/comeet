"use client";

import { useEffect, useState, use } from "react";
import { getMeeting } from "@/lib/supabase/getMeeting";
import { updateMeetingTitle } from "@/lib/supabase/updateMeeting";
import Title from "@/components/Title";
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
            <div className="flex-1 px-6 py-6">
                <Title onChange={handleTitleChange}>{meeting.title}</Title>
            </div>
            <UserBar />
        </div>
    );
}
