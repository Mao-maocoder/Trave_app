-- ============================================
-- 中轴奇遇 - Supabase PostgreSQL Schema
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 用户表（关联 Supabase Auth）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 照片表
CREATE TABLE IF NOT EXISTS public.photos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  image_path TEXT NOT NULL,
  spot_id TEXT,
  caption TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 照片点赞
CREATE TABLE IF NOT EXISTS public.photo_likes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_id BIGINT NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, photo_id)
);

-- 照片评论
CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  photo_id BIGINT NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  reply_to_username TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 兼容已创建的旧表：CREATE TABLE IF NOT EXISTS 不会补齐新增字段
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS reply_to_username TEXT;

-- 评论点赞
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment_id BIGINT NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);

-- 收藏
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);

-- 动态
CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  spot_id TEXT,
  image_path TEXT,
  ip_location TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 动态点赞
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- 动态评论
CREATE TABLE IF NOT EXISTS public.post_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT REFERENCES public.post_comments(id) ON DELETE CASCADE,
  reply_to_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 成就
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- 景点访问
CREATE TABLE IF NOT EXISTS public.spot_visits (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);

-- 会话
CREATE TABLE IF NOT EXISTS public.conversations (
  id BIGSERIAL PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- 消息
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 用户反馈
CREATE TABLE IF NOT EXISTS public.feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_photos_user ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_spot ON public.photos(spot_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_spot ON public.posts(spot_id);
CREATE INDEX IF NOT EXISTS idx_comments_photo ON public.comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at);

-- RLS (Row Level Security) — 先全部开放，后续按需收紧
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（开发阶段，后续可收紧）
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'users','photos','posts','comments','post_comments',
      'favorites','photo_likes','post_likes','comment_likes',
      'user_achievements','spot_visits','conversations','messages','feedback'
    ])
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND policyname = format('allow_all_%s', t)
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        format('allow_all_%s', t),
        t
      );
    END IF;
  END LOOP;
END $$;

-- 注册时自动创建用户记录的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
