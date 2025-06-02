'use client';

import { supabase } from "../supabase.js";

export async function getMeeting(meetingId) {
    const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
    
    return data;
} 