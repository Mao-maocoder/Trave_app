export interface Achievement {
  id: string;
  name: { zh: string; en: string };
  desc: { zh: string; en: string };
  icon: string;
  category: "explore" | "photo" | "social" | "favorite";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    name: { zh: "初来乍到", en: "First Step" },
    desc: { zh: "浏览 1 个景点详情", en: "View 1 spot detail" },
    icon: "🚶",
    category: "explore",
  },
  {
    id: "explorer_3",
    name: { zh: "中轴行者", en: "Axis Walker" },
    desc: { zh: "浏览 3 个不同景点", en: "View 3 different spots" },
    icon: "🗺️",
    category: "explore",
  },
  {
    id: "axis_master",
    name: { zh: "中轴通", en: "Axis Master" },
    desc: { zh: "浏览全部 7 个景点", en: "View all 7 spots" },
    icon: "🏆",
    category: "explore",
  },
  {
    id: "first_photo",
    name: { zh: "初试身手", en: "First Shot" },
    desc: { zh: "上传 1 张照片", en: "Upload 1 photo" },
    icon: "📸",
    category: "photo",
  },
  {
    id: "photographer",
    name: { zh: "摄影达人", en: "Photographer" },
    desc: { zh: "上传 5 张照片", en: "Upload 5 photos" },
    icon: "📷",
    category: "photo",
  },
  {
    id: "first_post",
    name: { zh: "初次发声", en: "First Post" },
    desc: { zh: "发布 1 条动态", en: "Create 1 post" },
    icon: "✍️",
    category: "social",
  },
  {
    id: "social_butterfly",
    name: { zh: "社交达人", en: "Social Butterfly" },
    desc: { zh: "发布 10 条动态", en: "Create 10 posts" },
    icon: "🦋",
    category: "social",
  },
  {
    id: "commenter",
    name: { zh: "评论达人", en: "Top Commenter" },
    desc: { zh: "发表 10 条评论", en: "Post 10 comments" },
    icon: "💬",
    category: "social",
  },
  {
    id: "first_fav",
    name: { zh: "初识中轴", en: "First Favorite" },
    desc: { zh: "收藏 1 个景点", en: "Favorite 1 spot" },
    icon: "❤️",
    category: "favorite",
  },
  {
    id: "collector",
    name: { zh: "中轴收藏家", en: "Axis Collector" },
    desc: { zh: "收藏全部 7 个景点", en: "Favorite all 7 spots" },
    icon: "💎",
    category: "favorite",
  },
];
