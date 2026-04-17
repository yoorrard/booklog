-- =========================================================
--  우리 반 독서통장 (booklog) :: 초기 스키마 + RLS
--  - Supabase Postgres 기준
--  - 교사/학생 두 역할을 auth.users 에 얹고, 도메인 테이블로 메타데이터 관리
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- 역할/프로필 ----------------------------------

-- 모든 사용자의 공통 역할 플래그 (teacher/student)
create type user_role as enum ('teacher', 'student');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- 교사 전용 메타
create table if not exists public.teachers (
  id uuid primary key references public.profiles(id) on delete cascade,
  school text,
  created_at timestamptz not null default now()
);

-- 학급
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,
  grade text,
  join_code text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists classes_teacher_idx on public.classes(teacher_id);

-- 학생 전용 메타
create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_number int not null,           -- 학급 내 번호
  login_id text not null unique,         -- 교사가 배부한 아이디 (ex. 2024-3-2-05)
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  unique (class_id, student_number)
);
create index if not exists students_class_idx on public.students(class_id);

-- ---------- 도서 / 기록 ----------------------------------

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  author text,
  publisher text,
  genre text,
  pages int,
  cover_url text,                  -- 외부 URL or Supabase Storage URL
  status text not null default 'reading' check (status in ('reading','done','pause')),
  started_at date,
  finished_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists books_student_idx on public.books(student_id);

-- 테마 enum 은 자주 추가될 수 있으니 text + check 로 관리
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  record_type text not null check (record_type in ('short','long')),
  theme text not null check (theme in (
    'free','quote','feeling','summary','learn','recommend','letter','character','question','review'
  )),
  title text,
  content text not null,
  mood text,                       -- 😊 이모지 문자열
  stars int check (stars between 0 and 5),
  created_at timestamptz not null default now()
);
create index if not exists records_book_idx on public.records(book_id);
create index if not exists records_student_idx on public.records(student_id);
create index if not exists records_theme_idx on public.records(theme);
create index if not exists records_created_idx on public.records(created_at desc);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists books_touch on public.books;
create trigger books_touch
  before update on public.books
  for each row execute function public.touch_updated_at();

-- ---------- 조회 편의 뷰 ---------------------------------

create or replace view public.student_stats as
select
  s.id                                   as student_id,
  s.class_id,
  p.display_name,
  count(distinct b.id)                   as book_count,
  count(distinct b.id) filter (where b.status='done') as finished_count,
  coalesce(sum(b.pages) filter (where b.status='done'), 0) as total_pages,
  count(r.id)                            as record_count,
  count(r.id) filter (where r.record_type='short') as short_count,
  count(r.id) filter (where r.record_type='long')  as long_count,
  max(r.created_at)                      as last_record_at
from public.students s
join public.profiles p on p.id = s.id
left join public.books b on b.student_id = s.id
left join public.records r on r.student_id = s.id
group by s.id, s.class_id, p.display_name;

-- ---------- RLS 활성화 ------------------------------------

alter table public.profiles  enable row level security;
alter table public.teachers  enable row level security;
alter table public.classes   enable row level security;
alter table public.students  enable row level security;
alter table public.books     enable row level security;
alter table public.records   enable row level security;

-- 헬퍼: 현재 사용자가 교사인가
create or replace function public.is_teacher()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher');
$$;

-- 헬퍼: 특정 학급의 담당 교사인가
create or replace function public.owns_class(cid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.classes c where c.id = cid and c.teacher_id = auth.uid());
$$;

-- 헬퍼: 특정 학생이 내가 담당하는 학급 소속인가
create or replace function public.owns_student(sid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = sid and c.teacher_id = auth.uid()
  );
$$;

-- ===== profiles =====
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_teacher());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ===== teachers =====
drop policy if exists "teachers self all" on public.teachers;
create policy "teachers self all" on public.teachers
  for all using (id = auth.uid()) with check (id = auth.uid());

-- ===== classes =====
drop policy if exists "classes teacher all" on public.classes;
create policy "classes teacher all" on public.classes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "classes student read" on public.classes;
create policy "classes student read" on public.classes
  for select using (
    exists(select 1 from public.students s where s.id = auth.uid() and s.class_id = classes.id)
  );

-- ===== students =====
drop policy if exists "students teacher all" on public.students;
create policy "students teacher all" on public.students
  for all using (public.owns_class(class_id))
  with check (public.owns_class(class_id));

drop policy if exists "students self read" on public.students;
create policy "students self read" on public.students
  for select using (id = auth.uid());

drop policy if exists "students self update" on public.students;
create policy "students self update" on public.students
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ===== books =====
drop policy if exists "books student own" on public.books;
create policy "books student own" on public.books
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "books teacher read" on public.books;
create policy "books teacher read" on public.books
  for select using (public.owns_student(student_id));

-- ===== records =====
drop policy if exists "records student own" on public.records;
create policy "records student own" on public.records
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "records teacher read" on public.records;
create policy "records teacher read" on public.records
  for select using (public.owns_student(student_id));
