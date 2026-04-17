# Booklog · 우리 반 독서통장

교사가 학급을 만들고, 학생들이 스스로 독서 기록을 쌓아가는 **풀스택 학급 독서통장** 서비스입니다.
한 줄 기록 · 긴 감상 · 10가지 테마 기록을 모두 지원하고, 교사 대시보드에서 학급 전체의 기록·통계를 한눈에 확인할 수 있습니다.

## 기술 스택

| 계층 | 선택 | 이유 |
| --- | --- | --- |
| 프론트 + 서버 렌더링 | **Next.js 14 (App Router) + TypeScript** | 서버 컴포넌트 / 미들웨어로 세션·RLS 친화적 구조. Vercel에 바로 배포해 수천 명 규모의 동시 접속을 감당. |
| 데이터베이스 + 인증 | **Supabase (Postgres · Auth · RLS · Storage)** | 교사·학생 이원 인증을 Postgres Row Level Security로 엄격히 분리 가능. Firebase 대비 관계형 데이터 모델링·집계 쿼리에 유리. |
| 스타일 | **Tailwind CSS + Pretendard Variable** | 세련된 sans-serif 타이포그래피, 모바일 친화 디자인 |
| 차트 | **Recharts** | React 친화, 반응형, 커스터마이징 용이 |

### 왜 Supabase인가
- **RLS 로 학급 경계 강제**: 교사/학생 각자 자신의 데이터만 조회/수정 가능.
- **대량 계정 생성**: Admin API 로 한 번에 수십 명의 학생 계정 발급 + 서비스 롤 키로 초기 비밀번호 세팅.
- **관계형 집계**: 학급별 독서량, 테마별 분포, 누적 페이지 등 교사 인사이트를 SQL로 깔끔하게 만들 수 있음.

## 주요 기능

### 교사
- 이메일 회원가입/로그인
- 학급 생성 (초대 코드 자동 발급)
- **학생 일괄 생성**: 번호·이름 붙여넣기 → 아이디 자동 생성 (`{join_code}-NN`) → 인쇄 가능한 배부표
- 학급별 재학생 관리 (비밀번호 초기화·삭제)
- 학급 기록 타임라인 + 테마/유형 필터
- 학생별 상세 (책장·기록)
- **인사이트 대시보드**: 테마 분포, 8주 추이, 리더보드

### 학생
- 교사가 배부한 아이디 + 초기 비밀번호(`123456`) 로 로그인
- **최초 로그인 시 비밀번호 변경 강제** (미들웨어 + DB 플래그로 이중 보호)
- 책 추가 (Google Books 검색 또는 직접 입력 · 표지 업로드 지원)
- **한 줄 / 긴 기록** + 10가지 테마(자유, 인상 깊은 구절, 감정, 줄거리 요약, 배운 점, 추천 이유, 주인공에게 편지, 인물 탐구, 질문, 한 줄 감상)
- 별점 · 기분 이모지 · 기록 제목
- 기록 타임라인, 테마·유형 필터
- **나의 독서 통장**: 테마 분포·분야 원형·8주 흐름·12주 히트맵·배지

## 시작하기 (로컬)

### 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 프로젝트를 생성.
2. `Project Settings → API` 에서 다음 값을 복사.
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 (❗ 서버에서만 사용)
3. `SQL Editor` 에 `supabase/migrations/0001_init.sql` 파일 내용을 붙여넣고 실행.

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 을 열고 값을 채워 넣습니다.
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STUDENT_EMAIL_DOMAIN=booklog.local
```

> `STUDENT_EMAIL_DOMAIN` 은 학생 아이디에 붙여 가짜 이메일(`{id}@booklog.local`)을 만들 때 사용합니다. 한 번 정하면 변경하지 마세요.

### 3. 개발 서버 실행
```bash
npm install
npm run dev
# http://localhost:3000
```

### 4. 초기 사용 시나리오
1. `/signup/teacher` 에서 교사 계정 생성
2. `/teacher/classes` 에서 학급 생성
3. 학급 상세 → **학생 일괄 생성** 에 명단 붙여넣기
   ```
   1\t김도서
   2\t박책벌레
   3\t최독자
   ```
4. 생성된 배부표 인쇄 → 학생에게 아이디 배부 (초기 비밀번호 `123456`)
5. 학생 로그인 → 비밀번호 변경 → 책 추가 & 기록 시작

## 배포 (Vercel)
1. Vercel 에 이 저장소를 연결.
2. 위 환경변수 4개를 **Vercel Project Settings → Environment Variables** 에 동일하게 추가.
3. Deploy. Supabase 의 `Authentication → URL Configuration` 에 프로덕션 도메인을 추가하세요.

## 데이터 모델

```
profiles (id = auth.users.id, role, display_name)
├── teachers (id)
│   └── classes (id, name, grade, join_code)
│        └── students (id, class_id, student_number, login_id, must_change_password)
│             ├── books (id, title, author, cover_url, pages, genre, status, ...)
│             └── records (id, book_id, record_type, theme, title, content, mood, stars, ...)
```

모든 테이블에 RLS 정책을 걸어:
- **학생**은 자기 id의 books/records 만 select/insert/update/delete
- **교사**는 `owns_class(class_id)` / `owns_student(student_id)` 로 자기 반 학생의 데이터만 select
- profiles/classes는 자기 행 + 담당 학생 조회 허용

## 보안 고려
- 서비스 롤 키는 `lib/supabase/admin.ts` 내부에서만 사용, 어떤 클라이언트 번들에도 포함되지 않습니다.
- 학생 아이디 존재 여부 누출 방지를 위해 `/api/auth/student/resolve` 는 성공 응답의 포맷을 일정하게 유지합니다.
- 비밀번호 초기화/학생 삭제는 교사 권한 검증(`classes.teacher_id == auth.uid()`) 후에만 수행.
- 최초 로그인 시 비밀번호 변경은 **미들웨어(HTTP 레이어)** + **DB 플래그** 양쪽에서 강제합니다.

## 폴더 구조

```
app/
  page.tsx                       랜딩
  signup/teacher/                교사 회원가입
  login/teacher · login/student  로그인
  teacher/                       교사 대시보드
    classes/[id]/                학급 관리 · 일괄 생성
    classes/[id]/records/        학급 기록 피드
    students/[id]/               학생 상세
    insights/                    인사이트 차트
  student/                       학생 앱
    books/[id]/                  책 상세 + 기록 타임라인
    records/                     기록 모아보기
    stats/                       나의 독서 통장
  api/                           서버 API (service role 사용)
components/                      공용 UI + 차트
lib/supabase/                    클라이언트/서버/관리자 헬퍼
supabase/migrations/             스키마 + RLS + 헬퍼 함수
middleware.ts                    역할 기반 라우팅 가드
```

## 라이선스
MIT
