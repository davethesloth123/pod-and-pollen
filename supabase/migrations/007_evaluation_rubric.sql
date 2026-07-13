-- Phase 3: BIS-style evaluation scorecard.
-- Scores are stored as a JSON map of rubric category key -> value, with the
-- summed total and the rubric id. Legacy columns (form/colour/etc.) remain for
-- reading older records but are no longer written.
alter table public.evaluations add column if not exists scores jsonb;
alter table public.evaluations add column if not exists total  numeric(5,1);
alter table public.evaluations add column if not exists rubric text;
