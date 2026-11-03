-- Per-school interface look: 'classic' (current) or 'pro' (Professional). Set by the Super Admin.
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ui_look TEXT NOT NULL DEFAULT 'classic';
