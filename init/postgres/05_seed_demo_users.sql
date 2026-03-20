\connect wovo_ai

INSERT INTO demo_users (id, name, role, avatar_color) VALUES
  ('sarah-chen', 'Sarah Chen', 'Compliance Officer', 'blue'),
  ('marcus-johnson', 'Marcus Johnson', 'Regional Manager', 'green'),
  ('priya-patel', 'Priya Patel', 'Auditor', 'purple'),
  ('david-kim', 'David Kim', 'Operations Lead', 'amber'),
  ('ana-santos', 'Ana Santos', 'ESG Director', 'rose')
ON CONFLICT (id) DO NOTHING;
