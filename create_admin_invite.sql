-- 管理者用の初期招待コード発行（最初のユーザー登録用）
-- ※これは管理者（taiseipaisen@gmail.com）がサインアップするための特別なコード

INSERT INTO invitations (email, code, expires_at, used)
VALUES 
  ('taiseipaisen@gmail.com', 'ADMIN-2026-INIT', NOW() + INTERVAL '30 days', false);

-- 確認
SELECT * FROM invitations;
