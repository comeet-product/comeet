import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 사용자를 데이터베이스에서 삭제
 * @param {string} userId - 삭제할 사용자 ID
 * @returns {Object} - 성공/실패 결과
 */
export async function deleteUser(userId) {
  try {
    console.log('=== User Deletion Process ===');
    console.log('User ID to delete:', userId);
    console.log('User ID type:', typeof userId);

    if (!userId) {
      return {
        success: false,
        message: '사용자 ID가 필요합니다.'
      };
    }

    // userId가 문자열이고 유효한 길이인지 확인
    if (typeof userId !== 'string' || userId.trim() === '') {
      console.log('Invalid userId format:', userId);
      return {
        success: false,
        message: '올바르지 않은 사용자 ID 형식입니다.'
      };
    }

    // 1. 사용자 존재 여부 확인
    console.log('Checking if user exists in database...');
    const { data: existingUser, error: checkError } = await supabase
      .from('user')
      .select('userid, name')
      .eq('userid', userId)
      .maybeSingle();

    console.log('Database query result:', { existingUser, checkError });

    if (checkError) {
      console.error('Database error while checking user:', checkError);
      return {
        success: false,
        message: '사용자 조회 중 오류가 발생했습니다.'
      };
    }

    if (!existingUser) {
      console.log('User not found - existingUser is null/undefined');
      return {
        success: false,
        message: '해당 사용자를 찾을 수 없습니다.'
      };
    }

    console.log('User found:', existingUser);

    // 2. availability 테이블에서 사용자 데이터 삭제
    const { error: availabilityError } = await supabase
      .from('availability')
      .delete()
      .eq('user_id', userId);

    if (availabilityError) {
      console.error('Error deleting availability:', availabilityError);
      return {
        success: false,
        message: '사용자의 가용성 데이터 삭제 중 오류가 발생했습니다.'
      };
    }

    console.log('Availability data deleted successfully');

    // 3. users 테이블에서 사용자 삭제
    const { error: userError } = await supabase
      .from('user')
      .delete()
      .eq('userid', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return {
        success: false,
        message: '사용자 삭제 중 오류가 발생했습니다.'
      };
    }

    console.log('User deleted successfully');

    return {
      success: true,
      message: `${existingUser.name}님이 성공적으로 삭제되었습니다.`,
      data: {
        deletedUser: existingUser
      }
    };

  } catch (error) {
    console.error('Unexpected error during user deletion:', error);
    return {
      success: false,
      message: '사용자 삭제 중 예상치 못한 오류가 발생했습니다.'
    };
  }
} 