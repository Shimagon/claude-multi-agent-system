-- ======================================
-- GameHub データベーススキーマ
-- ======================================

-- 1. プロフィールテーブル（ユーザー情報）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  invite_quota INTEGER DEFAULT 5,
  invites_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 招待コードテーブル
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 3. RLS (Row Level Security) を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 4. プロフィールのポリシー
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are created automatically" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. 招待コードのポリシー
CREATE POLICY "Anyone can check invitation validity" ON invitations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create invitations" ON invitations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own invitations" ON invitations
  FOR UPDATE USING (auth.uid() = created_by);

-- 6. 新規ユーザー登録時にプロフィールを自動作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, is_admin, invite_quota)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'taiseipaisen@gmail.com' THEN TRUE ELSE FALSE END,
    CASE WHEN NEW.email = 'taiseipaisen@gmail.com' THEN -1 ELSE 5 END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 招待送信数をインクリメントする関数
CREATE OR REPLACE FUNCTION public.increment_invites_sent(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET invites_sent = invites_sent + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
