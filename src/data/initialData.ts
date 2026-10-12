export interface Product {
  id: string;
  name: string;
  category: 'Watches' | 'Perfumes' | 'Accessories';
  price: number;
  old_price?: number;
  image: string;
  description: string;
  stock: number;
  featured?: boolean;
  specifications: Record<string, string>;
  createdAt?: string;
}

export interface CustomerDetails {
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

export interface EmailNotificationStatus {
  customer: 'sent' | 'pending' | 'failed' | 'not_configured';
  admin: 'sent' | 'pending' | 'failed' | 'not_configured';
  error?: string;
  lastAttempt?: string;
}

export interface PhoneNotificationStatus {
  status: 'sent' | 'pending' | 'failed' | 'not_configured';
  recipient?: string;
  provider?: string;
  error?: string;
  lastAttempt?: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: 'Unpaid' | 'Paid';
  emailNotificationStatus?: EmailNotificationStatus;
  phoneNotificationStatus?: PhoneNotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  currency: string;
  freeShippingThreshold: number;
  shippingFee: number;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
  adminEmail: string;
  adminPhone?: string;
  gmailSenderEmail: string;
  gmailAppPassword: string;
}

export const INITIAL_PRODUCTS: Product[] = [{id:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,old_price:29999,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`,description:`A refined everyday chronograph with a premium metal finish, sapphire crystal lens, and a timeless dual-subdial dial.`,stock:16,featured:true,specifications:{Case:`42mm 316L Stainless Steel`,Movement:`Precision Japanese Quartz Chronograph`,Glass:`Scratch-Resistant Sapphire Crystal`,WaterResistance:`5 ATM (50 Meters)`,Strap:`Solid Steel Link Bracelet with Butterfly Clasp`},createdAt:`2026-01-10T12:00:00.000Z`},{id:`noir-automatic`,name:`Noir Automatic`,category:`Watches`,price:32999,image:`https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80`,description:`Minimal automatic styling designed for evening and formal wear with an exposed exhibition caseback.`,stock:10,featured:true,specifications:{Case:`40mm Matte Obsidian Black PVD`,Movement:`Automatic Self-Winding (40hr reserve)`,Glass:`Anti-Reflective Sapphire Crystal`,WaterResistance:`5 ATM`,Strap:`Genuine Full-Grain Italian Calfskin`},createdAt:`2026-01-12T12:00:00.000Z`},{id:`imperial-silver`,name:`Imperial Silver`,category:`Watches`,price:18999,image:`https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80`,description:`Clean silver-tone design with a classic silhouette, sunburst dial, and faceted baton indices.`,stock:25,featured:false,specifications:{Case:`39mm Polished Stainless Steel`,Movement:`Slimline High-Precision Quartz`,Glass:`Hardened Mineral Crystal`,WaterResistance:`3 ATM`,Strap:`Engineered Brushed Steel Mesh`},createdAt:`2026-01-15T12:00:00.000Z`},{id:`monarch-rose-gold`,name:`Monarch Rose Gold`,category:`Watches`,price:36500,old_price:42000,image:`https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80`,description:`Warm 18K rose gold-tone bezel accented by a guilloché dial and genuine hand-stitched leather strap.`,stock:7,featured:true,specifications:{Case:`41mm 18K Rose Gold Ion-Plated Steel`,Movement:`Automatic 24-Jewel Caliber`,Glass:`Double-Domed Sapphire Crystal`,WaterResistance:`5 ATM`,Strap:`Handcrafted Chocolate Brown Croc-Embossed Leather`},createdAt:`2026-02-01T12:00:00.000Z`},{id:`royal-oud`,name:`Royal Oud`,category:`Perfumes`,price:7499,old_price:8999,image:`https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80`,description:`A warm, rich fragrance with authentic Cambodian oud-inspired depth, spiced cardamom, and elegant smokey woods.`,stock:40,featured:true,specifications:{Concentration:`Extrait de Parfum (30% Oil)`,TopNotes:`Cardamom, Pink Pepper, Bergamot`,HeartNotes:`Agarwood (Oud), Cedarwood, Rose Otto`,BaseNotes:`Sandalwood, Amber Resin, Tonka Bean`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-01-10T12:00:00.000Z`},{id:`velvet-noir`,name:`Velvet Noir`,category:`Perfumes`,price:6499,image:`https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80`,description:`A sophisticated evening scent with smooth Damascus rose, rich cocoa notes, and a velvety amber trail.`,stock:30,featured:true,specifications:{Concentration:`Eau de Parfum (25% Oil)`,TopNotes:`Black Currant, French Lavender, Mandarin`,HeartNotes:`Midnight Jasmine, Cocoa Pod, Black Rose`,BaseNotes:`Madagascar Vanilla, Patchouli, Cashmere Musk`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-01-14T12:00:00.000Z`},{id:`aura-oud`,name:`Aura Oud`,category:`Perfumes`,price:5499,image:`https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=80`,description:`Modern fresh-oriental fragrance with an invigorating citrus burst that dries down to confident, long-lasting presence.`,stock:35,featured:false,specifications:{Concentration:`Eau de Parfum (22% Oil)`,TopNotes:`Calabrian Bergamot, Crisp Apple, Mint`,HeartNotes:`Birch Wood, Patchouli, Moroccan Jasmine`,BaseNotes:`White Amber, Musk, Light Agarwood`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-01-16T12:00:00.000Z`},{id:`crown-amber`,name:`Crown Amber`,category:`Perfumes`,price:8200,old_price:9500,image:`https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80`,description:`Deep sensual golden amber laced with smoked bourbon vanilla, saffron, and aged tobacco leaf.`,stock:15,featured:true,specifications:{Concentration:`Extrait de Parfum (32% Oil)`,TopNotes:`Golden Saffron, Nutmeg, Bitter Almond`,HeartNotes:`Baltic Amber, Labdanum, Honeyed Leather`,BaseNotes:`Bourbon Vanilla, Guaiac Wood, Benzoin`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-02-05T12:00:00.000Z`},{id:`celestial-tourbillon`,name:`Celestial Tourbillon`,category:`Watches`,price:45000,old_price:52e3,image:`https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80`,description:`Exquisite open-worked skeleton dial showcasing a precision mechanical caliber, deep midnight-blue chapter ring, and genuine alligator-grain leather strap.`,stock:8,featured:true,specifications:{Case:`43mm Forged 316L Stainless Steel`,Movement:`Skeletonized Automatic Mechanical Caliber`,Glass:`Anti-Reflective Sapphire Crystal`,WaterResistance:`5 ATM (50 Meters)`,Strap:`Midnight Blue Alligator-Embossed Calfskin`},createdAt:`2026-03-01T10:00:00.000Z`},{id:`aquamarine-diver`,name:`Aquamarine Diver`,category:`Watches`,price:28500,old_price:33e3,image:`https://images.unsplash.com/photo-1547996160-71dfabb1a7b4?auto=format&fit=crop&w=900&q=80`,description:`Professional maritime dive watch with unidirectional ceramic bezel, luminous Super-LumiNova markers, and robust screw-down crown.`,stock:14,featured:true,specifications:{Case:`42mm Marine-Grade Stainless Steel`,Movement:`High-Precision Japanese Automatic`,Glass:`Scratchproof Flat Sapphire with Date Cyclops`,WaterResistance:`30 ATM (300 Meters)`,Strap:`Solid Oyster-Link Steel Bracelet with Diver Extension`},createdAt:`2026-03-02T10:00:00.000Z`},{id:`heritage-gold-classic`,name:`Heritage Gold Classic`,category:`Watches`,price:22e3,image:`https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80`,description:`Ultra-thin champagne gold dress watch with elegant Roman numeral indices and hand-polished bevelled edges.`,stock:18,featured:false,specifications:{Case:`38mm 18K Yellow Gold Ion-Plated Steel`,Movement:`Ultra-Slim Swiss-Engineered Quartz`,Glass:`Sapphire-Coated Mineral Crystal`,WaterResistance:`3 ATM`,Strap:`Hand-Stitched Onyx Black Saffiano Leather`},createdAt:`2026-03-03T10:00:00.000Z`},{id:`phantom-carbon`,name:`Phantom Carbon Chrono`,category:`Watches`,price:38e3,old_price:44e3,image:`https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=900&q=80`,description:`Stealth matte forged carbon case paired with high-contrast tachymeter sub-dials and an ergonomic vulcanized rubber sport strap.`,stock:9,featured:true,specifications:{Case:`44mm Forged Carbon Fiber & Grade 5 Titanium`,Movement:`High-Beat Split-Second Chronograph`,Glass:`Double-Curved Sapphire with AR Coating`,WaterResistance:`10 ATM (100 Meters)`,Strap:`Perforated High-Grade Vulcanized Rubber`},createdAt:`2026-03-04T10:00:00.000Z`},{id:`sultans-blend`,name:`Sultan's Blend Extrait`,category:`Perfumes`,price:9500,old_price:11e3,image:`https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80`,description:`Regal oriental masterpiece boasting aged Taif rose petals, pure wild agarwood, royal ambergris, and sun-dried Persian saffron.`,stock:20,featured:true,specifications:{Concentration:`Extrait de Parfum (35% Pure Perfume Oil)`,TopNotes:`Taif Rose, Iranian Saffron, Pink Pepper`,HeartNotes:`Cambodian Oud, Golden Amber, Frankincense`,BaseNotes:`Royal Ambergris, Mysore Sandalwood, Dark Leather`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-03-05T10:00:00.000Z`},{id:`imperial-leather`,name:`Imperial Leather & Woods`,category:`Perfumes`,price:7999,image:`https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80`,description:`Opulent Tuscan leather intertwined with zesty Italian bergamot, dark vetiver, and smoked cedarwood for an unforgettable commanding trail.`,stock:25,featured:true,specifications:{Concentration:`Eau de Parfum (26% Oil)`,TopNotes:`Italian Bergamot, Cardamom, Clary Sage`,HeartNotes:`Tuscan Leather, Smoked Cedar, Violet Leaf`,BaseNotes:`Haitian Vetiver, Amber, Tonka Bean`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-03-06T10:00:00.000Z`},{id:`white-amber-crystal`,name:`White Amber Crystal`,category:`Perfumes`,price:6800,image:`https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80`,description:`Ethereal crystal-clean luxury opening with white jasmine blossoms, fresh cedar sprigs, warm solar amber, and a soft velvet musk veil.`,stock:30,featured:false,specifications:{Concentration:`Eau de Parfum (24% Oil)`,TopNotes:`White Freesia, Jasmine Petals, Sweet Neroli`,HeartNotes:`Crystalline White Amber, Virginian Cedarwood`,BaseNotes:`Cashmeran, Velvet White Musk, Golden Benzoin`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-03-07T10:00:00.000Z`},{id:`royal-tobacco-bourbon`,name:`Royal Tobacco & Bourbon`,category:`Perfumes`,price:8900,old_price:10200,image:`https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80`,description:`Addictive warm blend of cured tobacco blossom, aged Kentucky bourbon vanilla, roasted cacao, and golden honeycomb.`,stock:16,featured:true,specifications:{Concentration:`Extrait de Parfum (30% Oil)`,TopNotes:`Tobacco Blossom, Spiced Cinnamon, Star Anise`,HeartNotes:`Bourbon Vanilla Pod, Roasted Cacao, Tonka Bean`,BaseNotes:`Blonde Woods, Aged Tobacco Leaf, Honey Resin`,Volume:`100ml / 3.4 fl. oz.`},createdAt:`2026-03-08T10:00:00.000Z`}];

export const INITIAL_ORDERS: Order[] = [{id:`ROYAL-6332`,customer:{name:`Wahab`,email:`w71910833@gmail.com`,phone:`03016145941`,whatsapp:`03016145941`,address:`sailkot`,city:`Sialkot`,notes:``},items:[{id:`item-1790054668548-hubg`,productId:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,quantity:1,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`}],subtotal:24999,shippingFee:0,total:24999,status:`Pending`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-22T05:24:28.548Z`,updatedAt:`2026-09-22T05:24:28.548Z`},{id:`ROYAL-3218`,customer:{name:`Wahab`,email:`w71910833@gmail.com`,phone:`03016145941`,whatsapp:`03016145941`,address:`sailkot`,city:`Sialkot`,notes:``},items:[{id:`item-1790053886920-j6rl`,productId:`noir-automatic`,name:`Noir Automatic`,category:`Watches`,price:32999,quantity:1,image:`https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80`}],subtotal:32999,shippingFee:0,total:32999,status:`Pending`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-22T05:11:26.920Z`,updatedAt:`2026-09-22T05:11:26.920Z`},{id:`ROYAL-1649`,customer:{name:`Wahab`,email:`w71910833@gmail.com`,phone:`03016145941`,whatsapp:`03016145941`,address:`sailkot`,city:`Sialkot`,notes:``},items:[{id:`item-1790053305776-n43b`,productId:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,quantity:1,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`}],subtotal:24999,shippingFee:0,total:24999,status:`Pending`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-22T05:01:45.776Z`,updatedAt:`2026-09-22T05:01:45.776Z`},{id:`ROYAL-3529`,customer:{name:`Wahab`,email:`w71910833@gmail.com`,phone:`03016145941`,whatsapp:`03016145941`,address:`sailkot`,city:`Sialkot`,notes:``},items:[{id:`item-1790052953140-jd56`,productId:`noir-automatic`,name:`Noir Automatic`,category:`Watches`,price:32999,quantity:1,image:`https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80`},{id:`item-1790052953140-3cka`,productId:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,quantity:1,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`}],subtotal:57998,shippingFee:0,total:57998,status:`Shipped`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-22T04:55:53.140Z`,updatedAt:`2026-09-22T04:56:33.499Z`},{id:`ROYAL-3617`,customer:{name:`Test Customer`,email:`test@example.com`,phone:`03001234567`,address:`Test Address 123`,city:`Karachi`},items:[{id:`item-1790052864408-5zle`,productId:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,quantity:1,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`}],subtotal:24999,shippingFee:0,total:24999,status:`Pending`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-22T04:54:24.408Z`,updatedAt:`2026-09-22T04:54:24.409Z`},{id:`ROYAL-7819`,customer:{name:`Hamza Khan`,email:`hamza.k@gmail.com`,phone:`+92 300 1234567`,whatsapp:`+92 300 1234567`,address:`House 42, Street 14, Sector F-8/2`,city:`Islamabad`,notes:`Please call before delivery`},items:[{id:`item-1`,productId:`royal-chronograph`,name:`Royal Chronograph`,category:`Watches`,price:24999,quantity:1,image:`https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80`},{id:`item-2`,productId:`royal-oud`,name:`Royal Oud`,category:`Perfumes`,price:7499,quantity:1,image:`https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80`}],subtotal:32498,shippingFee:0,total:32498,status:`Processing`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Unpaid`,createdAt:`2026-09-20T10:30:00.000Z`,updatedAt:`2026-09-20T14:15:00.000Z`},{id:`ROYAL-6542`,customer:{name:`Ayesha Malik`,email:`ayesha.m@yahoo.com`,phone:`+92 321 9876543`,whatsapp:`+92 321 9876543`,address:`Apartment 4B, Clifton Block 5`,city:`Karachi`,notes:`Gift wrapping requested`},items:[{id:`item-3`,productId:`velvet-noir`,name:`Velvet Noir`,category:`Perfumes`,price:6499,quantity:2,image:`https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80`}],subtotal:12998,shippingFee:0,total:12998,status:`Delivered`,paymentMethod:`Cash on Delivery (COD)`,paymentStatus:`Paid`,createdAt:`2026-09-18T16:20:00.000Z`,updatedAt:`2026-09-19T18:00:00.000Z`},{id:`ROYAL-5201`,customer:{name:`Bilal Ahmed`,email:`bilal.ahmed@outlook.com`,phone:`+92 333 4567890`,whatsapp:`+92 333 4567890`,address:`15-L, Phase 5, DHA`,city:`Lahore`,notes:``},items:[{id:`item-4`,productId:`noir-automatic`,name:`Noir Automatic`,category:`Watches`,price:32999,quantity:1,image:`https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80`}],subtotal:32999,shippingFee:0,total:32999,status:`Shipped`,paymentMethod:`Direct Bank Transfer`,paymentStatus:`Paid`,createdAt:`2026-09-19T09:10:00.000Z`,updatedAt:`2026-09-20T11:00:00.000Z`}];

export const INITIAL_SETTINGS: StoreSettings = {storeName:`A.ROYAL`,tagline:`Luxury That Defines You`,phone:`+92 311 0706379`,whatsappNumber:`+923110706379`,adminPhone:`03110706379`,currency:`PKR`,freeShippingThreshold:5000,shippingFee:0,bankDetails:{bankName:`Meezan Bank Ltd`,accountTitle:`A.ROYAL LUXURY LTD`,accountNumber:`01010101010101`,iban:`PK00MEZN0001010101010101`},adminEmail:`wahab.nadeem6040@gmail.com`,gmailSenderEmail:`wahab.nadeem6040@gmail.com`,gmailAppPassword:`lyvh ubzg dhvb zesv`};

export const DEFAULT_ADMIN_PASSWORD = 'aroyal2026';
