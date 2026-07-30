-- 1. enum value (must be added before use in later migrations)
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'viewed' AFTER 'sent';

-- 2. invoice extras
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_link text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reminders_paused boolean NOT NULL DEFAULT false;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS reliability_score numeric(5,2);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_payment_received boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_invoice_overdue boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_reminder_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_weekly_digest boolean NOT NULL DEFAULT true;

-- 3. reminder schedules
CREATE TABLE IF NOT EXISTS public.reminder_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default sequence',
  is_default boolean NOT NULL DEFAULT false,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_schedules TO authenticated;
GRANT ALL ON public.reminder_schedules TO service_role;
ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminder schedules" ON public.reminder_schedules
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_reminder_schedules_updated_at BEFORE UPDATE ON public.reminder_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS reminder_schedules_user_idx ON public.reminder_schedules(user_id);

-- 4. reminder logs
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  step_index integer NOT NULL DEFAULT 0,
  step_label text,
  channel text NOT NULL DEFAULT 'email',
  message text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivery_status text NOT NULL DEFAULT 'sent',
  opened_at timestamptz,
  resulted_in_payment boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_logs TO authenticated;
GRANT ALL ON public.reminder_logs TO service_role;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminder logs" ON public.reminder_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_reminder_logs_updated_at BEFORE UPDATE ON public.reminder_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS reminder_logs_invoice_idx ON public.reminder_logs(invoice_id);

-- 5. payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'manual',
  reference text,
  status text NOT NULL DEFAULT 'succeeded',
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own payments" ON public.payments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS payments_invoice_idx ON public.payments(invoice_id);