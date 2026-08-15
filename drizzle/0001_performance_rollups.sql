-- Performance indexes and rollup stats tables

CREATE INDEX IF NOT EXISTS "quizzes_teacher_id_idx" ON "quizzes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_sessions_quiz_launched_idx" ON "quiz_sessions" USING btree ("quiz_id","launched_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempts_student_id_idx" ON "attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempts_session_status_idx" ON "attempts" USING btree ("session_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempts_submitted_at_idx" ON "attempts" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempt_answers_attempt_id_idx" ON "attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempt_answers_question_id_idx" ON "attempt_answers" USING btree ("question_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "session_stats" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"joined_count" integer DEFAULT 0 NOT NULL,
	"submitted_count" integer DEFAULT 0 NOT NULL,
	"in_progress_count" integer DEFAULT 0 NOT NULL,
	"submitted_score_sum" double precision DEFAULT 0 NOT NULL,
	"average_score" double precision,
	"highest_score" double precision,
	"lowest_score" double precision,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_wrong" integer DEFAULT 0 NOT NULL,
	"total_skipped" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "student_stats" (
	"student_id" text PRIMARY KEY NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"submitted_count" integer DEFAULT 0 NOT NULL,
	"didnt_finish_count" integer DEFAULT 0 NOT NULL,
	"submitted_score_sum" double precision DEFAULT 0 NOT NULL,
	"average_score" double precision,
	"highest_score" double precision,
	"lowest_score" double precision,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_wrong" integer DEFAULT 0 NOT NULL,
	"total_skipped" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "teacher_stats" (
	"teacher_id" uuid PRIMARY KEY NOT NULL,
	"quiz_count" integer DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"submitted_count" integer DEFAULT 0 NOT NULL,
	"live_in_progress_count" integer DEFAULT 0 NOT NULL,
	"didnt_finish_count" integer DEFAULT 0 NOT NULL,
	"submitted_score_sum" double precision DEFAULT 0 NOT NULL,
	"overall_average_score" double precision,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_wrong" integer DEFAULT 0 NOT NULL,
	"total_skipped" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "session_question_stats" (
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answered_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "session_question_stats_unique" ON "session_question_stats" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_question_stats_session_id_idx" ON "session_question_stats" USING btree ("session_id");--> statement-breakpoint

ALTER TABLE "session_stats" ADD CONSTRAINT "session_stats_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_stats" ADD CONSTRAINT "student_stats_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_stats" ADD CONSTRAINT "teacher_stats_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_stats" ADD CONSTRAINT "session_question_stats_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_stats" ADD CONSTRAINT "session_question_stats_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
