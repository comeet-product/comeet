# Comeet - 모임 일정 조율 서비스

Comeet은 여러 사람의 일정을 효율적으로 조율할 수 있는 웹 기반 모임 일정 조율 서비스입니다.

## 주요 기능

-   🗓️ 직관적인 타임테이블 인터페이스
-   👥 다수의 참여자 일정 조율
-   📱 모바일 친화적인 UI/UX
-   🎯 드래그 앤 드롭으로 쉽게 가능 시간 선택
-   🔍 확대/축소 및 스와이프로 편리한 탐색
-   📊 가능한 시간대 자동 분석 및 추천

## 기술 스택

-   **Frontend**: Next.js, React, Tailwind CSS
-   **Backend**: Node.js, Supabase

## 시작하기

### 필수 조건

-   Node.js 18.0.0 이상
-   npm 또는 yarn

### 설치

1. 저장소 클론

```bash
git clone https://github.com/comeet-product/comeet.git
cd comeet
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

## 사용 방법

1. 새로운 모임 생성

    - 모임 이름과 기간 설정
    - 참여자 초대 링크 생성

2. 일정 선택

    - 타임테이블에서 가능한 시간대 드래그로 선택
    - 확대/축소로 상세 시간 확인
    - 좌우 스와이프로 다른 날짜 확인

3. 결과 확인
    - 모든 참여자의 가능한 시간대 자동 분석
    - 최적의 모임 시간 추천
