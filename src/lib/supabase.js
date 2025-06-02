import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

// 클라이언트 컴포넌트용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseKey);

// 서버 컴포넌트용 Supabase 클라이언트
export const createServerClient = () => {
    return createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: false,
            }
        }
    );
};
