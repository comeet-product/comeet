'use client';

import { useEffect, useState, use } from 'react';
import { getMeeting } from '@/lib/supabase/getMeeting';
import Title from "@/components/Title";

export default function MeetingPage({ params }) {
    const [meeting, setMeeting] = useState(null);
    const unwrappedParams = use(params);

    useEffect(() => {
        getMeeting(unwrappedParams.id).then(setMeeting);
    }, [unwrappedParams.id]);

    if (!meeting) return null;

    return (
        <div>
            <Title>{meeting.title}</Title>
        </div>
    );
}