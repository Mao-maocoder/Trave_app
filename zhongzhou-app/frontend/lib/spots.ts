export interface Spot {
  id: string;
  name: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  description: { zh: string; en: string };
  history: { zh: string; en: string };
  tips: { zh: string[]; en: string[] };
  image: string;
  location: { lat: number; lng: number };
  tags: { zh: string[]; en: string[] };
}

export const spots: Spot[] = [
  {
    id: "yongdingmen",
    name: { zh: "永定门", en: "Yongdingmen" },
    subtitle: { zh: "中轴线南起点", en: "Southern Start of the Axis" },
    description: {
      zh: "永定门是北京中轴线的南起点，明清北京外城的正南门。始建于明嘉靖三十二年（1553年），寓意\"永远安定\"。现门楼为2004年复建，是北京城南的重要地标。",
      en: "Yongdingmen is the southern starting point of Beijing's Central Axis, the main south gate of the outer city during the Ming and Qing dynasties. First built in 1553, its name means 'Eternal Stability'. The current gate was reconstructed in 2004.",
    },
    history: {
      zh: "永定门始建于明嘉靖三十二年（1553年），是北京外城七大城门之一。1957年因城市建设需要被拆除，2004年依据历史资料复建。",
      en: "Built in 1553 during the Ming Dynasty, Yongdingmen was one of seven gates of Beijing's outer city. It was demolished in 1957 for urban development and reconstructed in 2004 based on historical records.",
    },
    tips: {
      zh: ["建议游览时间：30-45分钟", "免费开放", "可与先农坛一同游览"],
      en: ["Suggested visit: 30-45 minutes", "Free admission", "Can be visited together with Xiannongtan"],
    },
    image: "/images/spots/yongdingmen.webp",
    location: { lat: 39.8697, lng: 116.3972 },
    tags: { zh: ["历史古迹", "城门", "中轴线起点"], en: ["Historic Site", "City Gate", "Axis Start"] },
  },
  {
    id: "xiannongtan",
    name: { zh: "先农坛", en: "Xiannongtan" },
    subtitle: { zh: "皇家祭祀建筑群", en: "Royal Altar Complex" },
    description: {
      zh: "先农坛是明清两代皇帝祭祀先农神的场所，现为北京古代建筑博物馆。坛内保存有大量精美的古代建筑，是中国古代建筑艺术的珍贵遗产。",
      en: "Xiannongtan (Temple of Agriculture) was where Ming and Qing emperors worshiped the God of Agriculture. Now the Beijing Ancient Architecture Museum, it houses many exquisite ancient buildings.",
    },
    history: {
      zh: "始建于明永乐十八年（1420年），与天坛同期建成。是全国重点文物保护单位，也是北京中轴线世界文化遗产的重要组成部分。",
      en: "Built in 1420 during the Ming Dynasty, alongside the Temple of Heaven. It is a national key cultural relic protection unit and an important part of Beijing's Central Axis UNESCO World Heritage bid.",
    },
    tips: {
      zh: ["建议游览时间：1-2小时", "门票：15元", "每周一闭馆"],
      en: ["Suggested visit: 1-2 hours", "Admission: 15 RMB", "Closed on Mondays"],
    },
    image: "/images/spots/xiannongtan.webp",
    location: { lat: 39.8764, lng: 116.3936 },
    tags: { zh: ["祭祀建筑", "博物馆", "世界遗产"], en: ["Altar", "Museum", "World Heritage"] },
  },
  {
    id: "tiantan",
    name: { zh: "天坛", en: "Temple of Heaven" },
    subtitle: { zh: "世界文化遗产", en: "UNESCO World Heritage" },
    description: {
      zh: "天坛是明清两代皇帝祭天祈谷的场所，是中国现存最大的古代祭祀性建筑群。祈年殿、回音壁、圜丘坛等建筑举世闻名，1998年被列入世界文化遗产名录。",
      en: "The Temple of Heaven was where Ming and Qing emperors worshiped Heaven and prayed for good harvests. It is the largest existing ancient sacrificial complex in China, listed as UNESCO World Heritage in 1998.",
    },
    history: {
      zh: "始建于明永乐十八年（1420年），占地约273万平方米。天坛的建筑布局和设计体现了中国古代\"天圆地方\"的宇宙观。",
      en: "Built in 1420, covering 2.73 million square meters. The Temple of Heaven's layout reflects the ancient Chinese cosmology of 'round heaven, square earth'.",
    },
    tips: {
      zh: ["建议游览时间：2-3小时", "门票：15元（联票34元）", "清晨可看到老北京人晨练"],
      en: ["Suggested visit: 2-3 hours", "Admission: 15 RMB (combo 34 RMB)", "Morning exercise groups visible at dawn"],
    },
    image: "/images/spots/tiantan.webp",
    location: { lat: 39.8822, lng: 116.4066 },
    tags: { zh: ["世界遗产", "祭天", "祈年殿"], en: ["World Heritage", "Altar", "Prayer Hall"] },
  },
  {
    id: "qianmen",
    name: { zh: "前门", en: "Qianmen" },
    subtitle: { zh: "历史文化商业街", en: "Historic Commercial Street" },
    description: {
      zh: "前门大街是北京最著名的商业街之一，紧邻天安门广场南侧。这里汇聚了众多中华老字号，如全聚德、都一处、六必居等，是体验老北京文化的绝佳去处。",
      en: "Qianmen Street is one of Beijing's most famous commercial streets, south of Tiananmen Square. It hosts many time-honored Chinese brands like Quanjude, Duyichu, and Liubiju.",
    },
    history: {
      zh: "前门大街自明代起就是北京最繁华的商业区，已有600多年历史。2008年经过大规模修缮后重新开放，保留了清末民初的建筑风格。",
      en: "Qianmen Street has been Beijing's busiest commercial area since the Ming Dynasty, with over 600 years of history. After major renovation in 2008, it retains early 20th-century architectural style.",
    },
    tips: {
      zh: ["建议游览时间：2-3小时", "免费步行街", "推荐品尝老字号美食"],
      en: ["Suggested visit: 2-3 hours", "Free pedestrian street", "Try traditional Beijing cuisine"],
    },
    image: "/images/spots/qianmen.webp",
    location: { lat: 39.8986, lng: 116.3972 },
    tags: { zh: ["商业街", "老字号", "美食"], en: ["Commercial Street", "Heritage Brands", "Food"] },
  },
  {
    id: "gugong",
    name: { zh: "故宫", en: "Forbidden City" },
    subtitle: { zh: "紫禁城·世界五大宫之首", en: "The Imperial Palace" },
    description: {
      zh: "故宫是中国明清两代的皇家宫殿，旧称紫禁城，是世界上现存规模最大、保存最为完整的木质结构古建筑群。占地72万平方米，有房屋9999间半。",
      en: "The Forbidden City was the imperial palace of the Ming and Qing dynasties. It is the world's largest and best-preserved wooden ancient building complex, covering 720,000 sq m with 9,999.5 rooms.",
    },
    history: {
      zh: "始建于明永乐四年（1406年），历时14年建成。先后有24位皇帝在此居住执政。1925年成立故宫博物院，1987年列入世界文化遗产。",
      en: "Construction began in 1406 and took 14 years. 24 emperors lived and ruled here. The Palace Museum was established in 1925, and it became a UNESCO World Heritage Site in 1987.",
    },
    tips: {
      zh: ["建议游览时间：3-4小时", "门票：60元（旺季）/40元（淡季）", "必须提前网上预约", "周一闭馆"],
      en: ["Suggested visit: 3-4 hours", "Admission: 60 RMB (peak) / 40 RMB (off-peak)", "Online reservation required", "Closed on Mondays"],
    },
    image: "/images/spots/gugong.webp",
    location: { lat: 39.9163, lng: 116.3972 },
    tags: { zh: ["世界遗产", "皇家宫殿", "博物馆"], en: ["World Heritage", "Imperial Palace", "Museum"] },
  },
  {
    id: "shichahai",
    name: { zh: "什刹海万宁桥", en: "Shichahai Wanning Bridge" },
    subtitle: { zh: "元代古桥·运河遗产", en: "Yuan Dynasty Bridge · Canal Heritage" },
    description: {
      zh: "万宁桥是北京中轴线上最古老的桥梁，始建于元代至元二十二年（1285年），是京杭大运河北京段的关键闸口。桥下有镇水兽石雕，见证了北京700多年的水运历史。",
      en: "Wanning Bridge is the oldest bridge on Beijing's Central Axis, built in 1285 during the Yuan Dynasty. It was a key lock on the Grand Canal's Beijing section, with stone water-guardian sculptures beneath.",
    },
    history: {
      zh: "万宁桥始建于元代，是元大都城内通惠河上的重要闸桥。2000年修缮时发现了元代镇水兽石雕，是研究元代水利和运河文化的重要实物。",
      en: "Built in the Yuan Dynasty, Wanning Bridge was an important lock-bridge on the Tonghui River. Stone water-guardian sculptures from the Yuan era were discovered during 2000 restoration work.",
    },
    tips: {
      zh: ["建议游览时间：30-45分钟", "免费参观", "周边什刹海可划船"],
      en: ["Suggested visit: 30-45 minutes", "Free admission", "Boating available at nearby Shichahai"],
    },
    image: "/images/spots/shichahai_wanningqiao.webp",
    location: { lat: 39.9345, lng: 116.3908 },
    tags: { zh: ["古桥", "世界遗产", "大运河"], en: ["Ancient Bridge", "World Heritage", "Grand Canal"] },
  },
  {
    id: "zhonggulou",
    name: { zh: "钟鼓楼", en: "Bell and Drum Towers" },
    subtitle: { zh: "元明清报时中心", en: "Timekeeping Center" },
    description: {
      zh: "钟楼和鼓楼是北京中轴线的北端终点，始建于元代，是元明清三代的报时中心。鼓楼置鼓、钟楼悬钟，晨钟暮鼓声曾回荡在北京城上空。",
      en: "The Bell and Drum Towers mark the northern end of Beijing's Central Axis. Built in the Yuan Dynasty, they served as the timekeeping center for three dynasties, with morning bells and evening drums.",
    },
    history: {
      zh: "鼓楼建于元至元九年（1272年），钟楼建于明永乐十八年（1420年）。两楼前后纵置，气势雄伟，是古都北京的标志性建筑之一。",
      en: "The Drum Tower was built in 1272 and the Bell Tower in 1420. The two towers stand in a north-south line, magnificent landmarks of ancient Beijing.",
    },
    tips: {
      zh: ["建议游览时间：1-1.5小时", "门票：鼓楼20元、钟楼15元", "可登楼俯瞰胡同"],
      en: ["Suggested visit: 1-1.5 hours", "Admission: Drum Tower 20 RMB, Bell Tower 15 RMB", "Panoramic hutong views from the top"],
    },
    image: "/images/spots/zhonggulou.webp",
    location: { lat: 39.9408, lng: 116.3972 },
    tags: { zh: ["报时建筑", "胡同", "登高"], en: ["Timekeeping", "Hutong", "Viewpoint"] },
  },
];

export function getSpotById(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}
