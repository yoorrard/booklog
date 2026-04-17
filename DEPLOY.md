# 🚀 배포 가이드 (초보자용)

이 문서는 Booklog 를 인터넷에 공개해 **수천 명이 접속 가능한 서비스로 만드는** 전 과정을 따라 하기만 하면 되도록 정리했습니다.

---

## 🗺️ 전체 흐름 한눈에 보기

필요한 계정은 **딱 3개**입니다. 전부 **무료**로 가입할 수 있어요.

| 단계 | 무엇을 | 왜 | 예상 시간 |
|---|---|---|---|
| 1 | **Supabase** 프로젝트 만들기 | 데이터베이스 + 로그인 담당 | 5분 |
| 2 | **DB 스키마** 적용 | 테이블·권한 규칙 한 번에 설치 | 2분 |
| 3 | **인증 설정** (이메일 인증) | 이메일 링크로 교사 가입 가능하게 | 3분 |
| 4 | (선택) **Google OAuth** | "Google로 로그인" 버튼 활성화 | 7분 |
| 5 | **Vercel** 로 배포 | 인터넷에서 접속 가능한 주소 발급 | 5분 |
| 6 | 실제 도메인으로 **Supabase 보정** | 프로덕션 리다이렉트 허용 | 1분 |
| 7 | **테스트** | 교사 가입 → 학급 만들기 → 학생 로그인 | 5분 |

> 🤖 **제(Claude)가 미리 해둔 것**: 코드, DB 마이그레이션 SQL, 환경변수 예시, Supabase CLI 설정.
> 👤 **사용자가 해야 할 것**: 세 서비스에 로그인하여 버튼 몇 번 누르고 값 복사/붙여넣기.

---

## 1단계 · Supabase 프로젝트 만들기

> 💡 Supabase 는 "데이터베이스 + 로그인" 을 공짜로 주는 서비스입니다.
> 무료 요금제(Free Tier) 로도 한 달에 수만 건의 요청을 처리할 수 있어서, 반 학생 전원이 써도 충분합니다.

### 1-1. 회원가입
1. [https://supabase.com](https://supabase.com) 접속 → 오른쪽 위 **Start your project** 클릭.
2. **Continue with GitHub** 로 로그인하세요 (이미 GitHub 쓰시니 가장 편합니다).

### 1-2. 새 프로젝트 만들기
1. 대시보드에서 **New project** 클릭.
2. 아래 항목을 입력합니다.
   - **Project name**: `booklog` (아무거나 괜찮아요)
   - **Database Password**: 자동 생성 버튼을 누르고 **꼭 복사해 안전한 곳에 저장**. 다시는 안 보여줍니다.
   - **Region**: `Northeast Asia (Seoul)` ← 한국에서 가장 빨라요.
   - **Pricing Plan**: Free
3. **Create new project** 클릭 → 약 2분 정도 기다리면 초록 불이 들어옵니다.

---

## 2단계 · DB 스키마 적용 (표·권한 규칙 한번에 설치)

> 이 과정은 **복사 → 붙여넣기 → Run** 세 번이면 끝납니다.

1. 왼쪽 메뉴에서 **SQL Editor** (</> 아이콘) 클릭.
2. 오른쪽 위 **+ New query** 클릭해서 빈 편집창 열기.
3. 이 레포의 `supabase/migrations/0001_init.sql` 파일 내용을 **전체 복사** 합니다.
   - GitHub 에서: `supabase/migrations/0001_init.sql` → **Raw** 버튼 → Ctrl+A → Ctrl+C
4. SQL Editor 에 **붙여넣기**.
5. 오른쪽 아래 **Run** (또는 `Ctrl+Enter`) 클릭.
6. 아래 **Results** 에 `Success. No rows returned` 이 뜨면 완료.

✅ **확인**: 왼쪽 메뉴 **Table Editor** 를 열어 `classes`, `students`, `books`, `records`, `profiles`, `teachers` 테이블이 보이면 정상입니다.

---

## 3단계 · 이메일 인증 설정

교사가 회원가입할 때 이메일 인증 링크가 발송되도록 합니다.

### 3-1. 이메일 인증 활성화
1. 왼쪽 메뉴 **Authentication** → **Providers** (자물쇠 아이콘).
2. **Email** 을 클릭해서 펼치기.
3. **Confirm email** 스위치가 **ON** 인지 확인 (기본 ON). 아니라면 켭니다.
4. **Save** 클릭.

### 3-2. 리다이렉트 URL 등록
1. **Authentication → URL Configuration**.
2. **Site URL** 은 일단 `http://localhost:3000` 으로 두세요. (Vercel 배포 후 진짜 주소로 바꿉니다.)
3. **Redirect URLs** 에 아래 두 줄을 **하나씩** 추가:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
4. **Save**.

### 3-3. (선택) 한국어 메일 템플릿
1. **Authentication → Email Templates → Confirm signup**.
2. 본문을 아래처럼 바꿔도 좋아요 ({{ .ConfirmationURL }} 은 **절대 지우지 말고** 그대로 두세요):
   ```html
   <h2>📚 우리 반 독서통장에 오신 걸 환영합니다!</h2>
   <p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>
   <p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
   ```

---

## 4단계 · (선택) Google OAuth 활성화

> "Google 계정으로 계속하기" 버튼을 쓰고 싶을 때만 진행하세요. 건너뛰어도 이메일 가입은 잘 동작합니다.

### 4-1. Google Cloud Console 에서 클라이언트 만들기
1. [https://console.cloud.google.com](https://console.cloud.google.com) 로그인 (Google 계정이면 됨).
2. 상단 프로젝트 선택 → **새 프로젝트** → 이름 `booklog` → 만들기.
3. 왼쪽 메뉴 **APIs & Services → OAuth consent screen**.
   - User Type: **External** → Create.
   - App name: `Booklog`, 지원 이메일: 본인 이메일.
   - Developer contact: 본인 이메일.
   - 나머지는 Next → Next → Back to dashboard.
4. 왼쪽 메뉴 **APIs & Services → Credentials → + Create credentials → OAuth client ID**.
   - Application type: **Web application**
   - Name: `booklog-web`
   - Authorized redirect URIs 에 **딱 한 줄** 추가:
     ```
     https://<PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     > ⚠️ `<PROJECT-REF>` 는 본인 Supabase 프로젝트의 고유 주소예요.
     > Supabase 대시보드 → **Project Settings → API → Project URL** 에 있는 `https://xxxx.supabase.co` 의 `xxxx` 부분입니다.
   - **Create** 클릭 → **Client ID** 와 **Client secret** 이 표시됩니다. **두 값 모두 복사.**

### 4-2. Supabase 에 붙여넣기
1. Supabase 대시보드 **Authentication → Providers → Google**.
2. **Enable Google** 스위치 ON.
3. 방금 복사한 **Client ID**, **Client Secret** 붙여넣기.
4. **Save**.

---

## 5단계 · 환경변수 값 4개 복사해두기

Vercel 에 붙여넣을 값 4개를 미리 정리합니다.

1. Supabase 대시보드 **Project Settings → API**.
2. 아래 값들을 메모장 등에 임시 복사해 두세요.

| 이름 | 어디서 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** (`https://xxx.supabase.co`) | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon public** | 클라이언트에 노출돼도 안전 |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** | ⚠️ 절대 공개 금지, 서버 전용 |
| `STUDENT_EMAIL_DOMAIN` | 본인이 정함 | 예: `booklog.local` (한번 정하면 바꾸지 마세요) |

---

## 6단계 · Vercel 로 배포

### 6-1. Vercel 가입 & 레포 연결
1. [https://vercel.com/signup](https://vercel.com/signup) → **Continue with GitHub**.
2. 로그인 후 **Add New... → Project** 클릭.
3. **yoorrard/booklog** 레포의 **Import** 버튼 클릭.
4. **Git Branch** 항목에서 `claude/reading-journal-app-ViF1U` 를 선택
   (드롭다운이 기본적으로 `main` 이면 변경해주세요).

### 6-2. 환경변수 입력
**Environment Variables** 섹션에 **4개 모두** 추가합니다.
왼쪽이 Key, 오른쪽이 Value 입니다.

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJhbGciOi...............
SUPABASE_SERVICE_ROLE_KEY      = eyJhbGciOi...............
STUDENT_EMAIL_DOMAIN           = booklog.local
```

### 6-3. Deploy 클릭
1. **Deploy** 버튼을 누르면 2~3분 뒤에 🎉 축하 화면이 뜨면서 **xxxxxxxx.vercel.app** 주소가 발급됩니다.
2. 그 주소가 **실제 서비스 URL** 입니다. 복사해두세요.

---

## 7단계 · Supabase 에 실제 도메인 추가 (중요!)

3-2단계에서 `localhost` 만 넣었기 때문에, 실제 배포 주소에서는 로그인 리다이렉트가 막힙니다. 마지막 보정 한 번만 해주면 끝이에요.

1. Supabase **Authentication → URL Configuration**.
2. **Site URL** 을 방금 받은 Vercel 주소로 변경:
   ```
   https://xxxxxxxx.vercel.app
   ```
3. **Redirect URLs** 에 아래 두 줄을 **추가** (기존 localhost 줄은 그대로 두세요):
   ```
   https://xxxxxxxx.vercel.app/auth/callback
   https://xxxxxxxx.vercel.app/**
   ```
4. **Save**.

### (Google OAuth 쓰는 경우) 한 번 더
Google Cloud Console 의 OAuth Client 리다이렉트 URI 는 **Supabase 주소 하나**뿐이기 때문에 따로 바꿀 게 없어요. 건너뛰세요.

---

## 8단계 · 작동 확인 ✅

### 교사로 가입
1. `https://xxxxxxxx.vercel.app` 접속.
2. **교사 회원가입** → 이름·학교·이메일·비밀번호 입력 → 인증 메일 받기.
3. 받은 메일의 **이메일 인증하기** 링크 클릭 → `/teacher` 로 이동하면 성공!

### 학급 만들고 학생 계정 발급
1. **우리 반 관리 → 새 학급 만들기**.
2. 학급 상세로 들어가 **학생 일괄 생성** 에 아래처럼 붙여넣기:
   ```
   1	김도서
   2	박책벌레
   3	최독자
   ```
3. **3명 계정 생성** 클릭 → 배부표 **인쇄** 가능.

### 학생으로 로그인
1. 배부표의 **로그인 아이디** 와 초기 비번 `123456` 으로 `/login/student` 접속.
2. 새 비밀번호 설정 후 책장에서 첫 책 추가 + 기록 작성.

---

## 🆘 자주 겪는 문제

| 증상 | 해결 |
|---|---|
| 이메일 인증 메일이 안 와요 | 스팸함 확인. 또는 Supabase Free SMTP 한계(하루 최대 약 30통)일 수 있음 → 많이 쓸 때는 `Auth → Email → Custom SMTP` 에 본인 SMTP 정보 입력 (Gmail/Sendgrid 등). |
| "Email not confirmed" 로 로그인 실패 | 인증 링크 한 번 더 눌러주세요. 시간이 오래 지났다면 `Authentication → Users` 에서 본인 사용자 선택 → **Send magic link** 로 재발송. |
| Google 로그인 시 "redirect_uri_mismatch" | Google Cloud Console 의 Redirect URI 가 정확히 `https://<PROJECT-REF>.supabase.co/auth/v1/callback` 인지 확인. |
| Vercel 빌드 실패: `supabase ... is not defined` | 환경변수 4개가 **모두** 들어갔는지 Project Settings → Environment Variables 에서 확인 후 **Redeploy**. |
| 학생 일괄 생성 시 "권한 없음" | Service Role Key 가 Vercel 환경변수에 정확히 들어갔는지 확인. |
| 수정 후 반영이 안 돼요 | 이 브랜치로 push 한 뒤 Vercel → Deployments 에서 새 배포가 뜨는지 확인. 자동 배포가 꺼져 있다면 **Promote to Production** 클릭. |

---

## 💸 비용 정리
- Supabase Free: 프로젝트 2개 / 500MB DB / 월 50k MAU — 학급 여러 개도 충분.
- Vercel Hobby: 월 100GB 대역폭 / 무제한 배포 — 학급 수백 개도 여유.
- 합계: **무료**. 사용량이 압도적으로 늘어야 유료 전환 고려.

---

끝! 어려운 부분에서 막히시면 **그 단계 번호와 본 에러 메시지**를 알려주세요. 바로 잡아드립니다.
