-- ============================================================
-- Migration 021: Phase 4.3 Quiz Attempts + Project Submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id      UUID        NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  answers      JSONB       NOT NULL DEFAULT '{}',
  score        INT         NOT NULL DEFAULT 0,
  passed       BOOLEAN     NOT NULL DEFAULT false,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx   ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_idx   ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_lesson_idx ON public.quiz_attempts(lesson_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_own" ON public.quiz_attempts
  FOR ALL USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.project_submissions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.course_projects(id) ON DELETE CASCADE,
  course_id       UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  submission_type TEXT        NOT NULL
    CHECK (submission_type IN ('text','url','github','file')),
  content         TEXT,
  url             TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS project_submissions_user_idx    ON public.project_submissions(user_id);
CREATE INDEX IF NOT EXISTS project_submissions_project_idx ON public.project_submissions(project_id);

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_submissions_own" ON public.project_submissions
  FOR ALL USING (user_id = auth.uid());
