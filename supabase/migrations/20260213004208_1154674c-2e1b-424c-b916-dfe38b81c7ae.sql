-- Add configurable polling interval per project (default 120 seconds = 2 minutes)
ALTER TABLE public.projects
ADD COLUMN polling_interval_seconds integer NOT NULL DEFAULT 120;

-- Ensure valid range (30s to 600s = 30 seconds to 10 minutes)
CREATE OR REPLACE FUNCTION public.validate_polling_interval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.polling_interval_seconds < 30 THEN
    NEW.polling_interval_seconds := 30;
  ELSIF NEW.polling_interval_seconds > 600 THEN
    NEW.polling_interval_seconds := 600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_polling_interval_trigger
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.validate_polling_interval();