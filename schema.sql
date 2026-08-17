CREATE TABLE IF NOT EXISTS traveler_messages (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  city_country TEXT,
  message TEXT NOT NULL,
  approved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO traveler_messages (id, full_name, city_country, message, approved, created_at)
VALUES 
('def_1', 'Aarav Sharma', 'Pune, India', 'Reading about the journey of Vayu Mahesh deeply inspired me. It reminded me that purpose isn''t found overnight, but built with quiet discipline day by day.', 1, '2026-08-11T12:00:00.000Z'),
('def_2', 'Elena Rostova', 'Prague, Czech Republic', 'The stillness in these writings is palpable. A rare space on the internet to pause, breathe, and reflect on what truly matters.', 1, '2026-08-08T12:00:00.000Z'),
('def_3', 'Rohan Deshmukh', 'Nashik, India', 'From the sixty-four squares of chess to the path of devotion, your story resonates with anyone striving for higher focus.', 1, '2026-08-05T12:00:00.000Z');
