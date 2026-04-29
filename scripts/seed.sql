INSERT INTO jobs (company, role, status, job_url, salary_min, salary_max, location, is_remote, applied_at) VALUES
  ('Google',    'Software Engineer',         'interview', 'https://careers.google.com',    120000, 160000, 'Mountain View, CA', false, CURRENT_DATE - 10),
  ('Stripe',    'Backend Engineer',          'applied',   'https://stripe.com/jobs',       110000, 150000, 'Remote',            true,  CURRENT_DATE - 5),
  ('Shopify',   'Full Stack Developer',      'screening', 'https://shopify.com/careers',   100000, 140000, 'Remote',            true,  CURRENT_DATE - 7),
  ('Amazon',    'SDE II',                    'rejected',  'https://amazon.jobs',           115000, 155000, 'Seattle, WA',       false, CURRENT_DATE - 20),
  ('Vercel',    'Frontend Engineer',         'offer',     'https://vercel.com/careers',    105000, 135000, 'Remote',            true,  CURRENT_DATE - 15)
ON CONFLICT DO NOTHING;

INSERT INTO tags (name) VALUES ('remote'), ('fintech'), ('startup'), ('big-tech'), ('senior')
ON CONFLICT DO NOTHING;