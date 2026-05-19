export interface Product {
  id: string;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  price: number;
  originalPrice?: number;
  image: string;
  category: { zh: string; en: string };
  spot: string; // related spot id
  tags: { zh: string[]; en: string[] };
  inStock: boolean;
  rating: number;
  sales: number;
}

export const categories = [
  { zh: "全部", en: "All" },
  { zh: "文创摆件", en: "Collectibles" },
  { zh: "文具书签", en: "Stationery" },
  { zh: "服饰配饰", en: "Accessories" },
  { zh: "茶具瓷器", en: "Tea & Ceramics" },
  { zh: "图书音像", en: "Books & Media" },
];

export const products: Product[] = [
  {
    id: "forbidden-city-lamp",
    name: { zh: "紫禁城·脊兽小夜灯", en: "Forbidden City Ridge Beast Night Lamp" },
    description: {
      zh: "灵感源自故宫太和殿屋脊上的琉璃脊兽，采用景德镇高温陶瓷工艺手工烧制。柔和暖光伴你入眠，感受六百年紫禁城的守护之意。",
      en: "Inspired by the glazed ridge beasts on the Hall of Supreme Harmony. Handcrafted in Jingdezhen porcelain with a warm glow, bringing the Forbidden City's 600-year guardianship to your bedside.",
    },
    price: 268,
    originalPrice: 328,
    image: "/images/shop/forbidden-city-lamp.svg",
    category: { zh: "文创摆件", en: "Collectibles" },
    spot: "gugong",
    tags: { zh: ["故宫", "陶瓷", "夜灯", "文创"], en: ["Forbidden City", "Ceramic", "Night Lamp", "Creative"] },
    inStock: true,
    rating: 4.9,
    sales: 3256,
  },
  {
    id: "axis-scroll",
    name: { zh: "中轴线全景卷轴", en: "Central Axis Panoramic Scroll" },
    description: {
      zh: "以传统水墨画技法绘就北京中轴线7.8公里全景，从永定门到钟鼓楼，15处遗产要素尽收眼底。宣纸微喷，配红木画轴，可悬挂可收藏。",
      en: "A panoramic ink-wash painting of Beijing's 7.8 km Central Axis, from Yongdingmen to the Bell and Drum Towers. Printed on Xuan paper with rosewood scroll rods, ready to hang or collect.",
    },
    price: 198,
    image: "/images/shop/axis-scroll.svg",
    category: { zh: "文创摆件", en: "Collectibles" },
    spot: "yongdingmen",
    tags: { zh: ["中轴线", "卷轴", "水墨画", "收藏"], en: ["Central Axis", "Scroll", "Ink Painting", "Collectible"] },
    inStock: true,
    rating: 4.8,
    sales: 1892,
  },
  {
    id: "temple-of-heaven-tea-set",
    name: { zh: "天坛祈年殿·盖碗茶具", en: "Temple of Heaven Gaiwan Tea Set" },
    description: {
      zh: "以天坛祈年殿为设计原型，碗身浮雕三层攒尖屋顶纹饰，碗盖化作祈年殿宝顶。德化白瓷温润如玉，一套三件，品茶间感受天人合一的哲学。",
      en: "Modeled after the Hall of Prayer for Good Harvests. The bowl features a three-tiered roof relief, the lid becomes the殿's golden top. Dehua white porcelain, three-piece set, sip tea and feel the harmony of heaven and earth.",
    },
    price: 388,
    originalPrice: 458,
    image: "/images/shop/temple-of-heaven-tea-set.svg",
    category: { zh: "茶具瓷器", en: "Tea & Ceramics" },
    spot: "tiantan",
    tags: { zh: ["天坛", "茶具", "白瓷", "祈年殿"], en: ["Temple of Heaven", "Tea Set", "Porcelain", "Prayer Hall"] },
    inStock: true,
    rating: 4.9,
    sales: 2140,
  },
  {
    id: "drum-tower-notebook",
    name: { zh: "晨钟暮鼓·手工笔记本", en: "Morning Bells & Evening Drums Notebook" },
    description: {
      zh: "封面采用手工宣纸裱糊，烫金钟楼鼓楼剪影。内页为80g无酸纸，可180度平摊。附赠铜质书签一枚，刻有\"晨钟暮鼓\"四字。",
      en: "Hand-bound Xuan paper cover with gold-stamped silhouettes of the Bell and Drum Towers. 80g acid-free paper, lays flat at 180°. Includes a brass bookmark engraved 'Morning Bells, Evening Drums'.",
    },
    price: 88,
    image: "/images/shop/drum-tower-notebook.svg",
    category: { zh: "文具书签", en: "Stationery" },
    spot: "zhonggulou",
    tags: { zh: ["钟鼓楼", "笔记本", "手工", "书签"], en: ["Bell & Drum Towers", "Notebook", "Handmade", "Bookmark"] },
    inStock: true,
    rating: 4.7,
    sales: 4521,
  },
  {
    id: "qianmen-enamel-cup",
    name: { zh: "前门大街·搪瓷缸", en: "Qianmen Street Enamel Mug" },
    description: {
      zh: "复刻上世纪七八十年代北京搪瓷缸造型，手绘前门箭楼与老字号招牌图案。容量400ml，既可饮水也可当笔筒，满满老北京记忆。",
      en: "Recreated in the style of 1970s Beijing enamel mugs, hand-painted with Qianmen Arrow Tower and vintage shop signs. 400ml capacity, doubles as a pen holder. A cupful of old Beijing memories.",
    },
    price: 58,
    image: "/images/shop/qianmen-enamel-cup.svg",
    category: { zh: "茶具瓷器", en: "Tea & Ceramics" },
    spot: "qianmen",
    tags: { zh: ["前门", "搪瓷", "复古", "老北京"], en: ["Qianmen", "Enamel", "Vintage", "Old Beijing"] },
    inStock: true,
    rating: 4.6,
    sales: 6780,
  },
  {
    id: "wanning-bridge-bookmark",
    name: { zh: "万宁桥镇水兽·铜书签", en: "Wanning Bridge Water-Guardian Bronze Bookmark" },
    description: {
      zh: "取材自万宁桥下的元代镇水兽石雕，失蜡法铸造黄铜书签。古兽昂首伏波，寓意文思泉涌。配锦缎书签盒，送礼自用两相宜。",
      en: "Cast in brass using lost-wax technique, modeled after the Yuan Dynasty water-guardian beast beneath Wanning Bridge. Comes in a brocade gift box — a perfect literary companion.",
    },
    price: 128,
    image: "/images/shop/wanning-bridge-bookmark.svg",
    category: { zh: "文具书签", en: "Stationery" },
    spot: "shichahai",
    tags: { zh: ["万宁桥", "铜书签", "镇水兽", "文创"], en: ["Wanning Bridge", "Bronze", "Bookmark", "Creative"] },
    inStock: true,
    rating: 4.8,
    sales: 1567,
  },
  {
    id: "axis-silk-scarf",
    name: { zh: "中轴线·真丝方巾", en: "Central Axis Silk Scarf" },
    description: {
      zh: "以中轴线鸟瞰图为设计灵感，将七大核心景点化作丝巾上的几何图案。100%桑蚕丝，数码印花，色彩典雅。90×90cm大方巾，可披可系可裱框。",
      en: "Inspired by a bird's-eye view of the Central Axis, transforming seven core landmarks into geometric patterns. 100% mulberry silk, digital print, 90×90cm. Wear it, tie it, or frame it.",
    },
    price: 498,
    originalPrice: 598,
    image: "/images/shop/axis-silk-scarf.svg",
    category: { zh: "服饰配饰", en: "Accessories" },
    spot: "gugong",
    tags: { zh: ["中轴线", "真丝", "丝巾", "配饰"], en: ["Central Axis", "Silk", "Scarf", "Accessory"] },
    inStock: true,
    rating: 4.9,
    sales: 890,
  },
  {
    id: "axis-guidebook",
    name: { zh: "《漫步中轴线》深度导览手册", en: "Walking the Central Axis Guidebook" },
    description: {
      zh: "全彩印刷280页深度导览，涵盖15处遗产要素的历史故事、建筑密码与游览攻略。附赠手绘地图折页与中轴线音频导览二维码。",
      en: "Full-color 280-page guide covering 15 heritage sites — history, architectural secrets, and travel tips. Includes a fold-out hand-drawn map and QR codes for audio tours.",
    },
    price: 78,
    image: "/images/shop/axis-guidebook.svg",
    category: { zh: "图书音像", en: "Books & Media" },
    spot: "yongdingmen",
    tags: { zh: ["中轴线", "导览", "图书", "地图"], en: ["Central Axis", "Guidebook", "Book", "Map"] },
    inStock: true,
    rating: 4.7,
    sales: 5432,
  },
  {
    id: "xiannongtan-puzzle",
    name: { zh: "先农坛·榫卯积木模型", en: "Xiannongtan Mortise-Tenon Building Blocks" },
    description: {
      zh: "以先农坛太岁殿为原型，1:150微缩榫卯拼装模型。全实木材质，无需胶水，386块零件还原斗拱飞檐。拼装过程即是学习中国古建结构的旅程。",
      en: "Modeled after Xiannongtan's Taisui Hall at 1:150 scale. All-wood mortise-tenon construction, no glue needed. 386 pieces recreate bracket sets and flying eaves — building it teaches ancient Chinese architecture.",
    },
    price: 328,
    image: "/images/shop/xiannongtan-puzzle.svg",
    category: { zh: "文创摆件", en: "Collectibles" },
    spot: "xiannongtan",
    tags: { zh: ["先农坛", "榫卯", "积木", "古建"], en: ["Xiannongtan", "Mortise-Tenon", "Blocks", "Architecture"] },
    inStock: true,
    rating: 4.8,
    sales: 1234,
  },
  {
    id: "shichahai-fridge-magnets",
    name: { zh: "中轴七景·冰箱贴套装", en: "Seven Axis Landmarks Fridge Magnet Set" },
    description: {
      zh: "七枚一套，以珐琅工艺呈现中轴线七大核心景点。磁力强劲，可贴于冰箱、白板等金属表面。每枚背面印有景点简介，是了解中轴线的趣味入门。",
      en: "Seven-piece enamel magnet set featuring the Central Axis's core landmarks. Strong magnets for fridges and whiteboards. Each magnet has a brief landmark introduction on the back.",
    },
    price: 68,
    image: "/images/shop/shichahai-fridge-magnets.svg",
    category: { zh: "文创摆件", en: "Collectibles" },
    spot: "zhonggulou",
    tags: { zh: ["冰箱贴", "珐琅", "套装", "文创"], en: ["Fridge Magnet", "Enamel", "Set", "Creative"] },
    inStock: true,
    rating: 4.6,
    sales: 8920,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryZh: string): Product[] {
  if (categoryZh === "全部") return products;
  return products.filter((p) => p.category.zh === categoryZh);
}
