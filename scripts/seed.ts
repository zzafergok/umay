import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'umay-local';
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';

if (getApps().length === 0) {
  initializeApp({ projectId });
}

const db = getFirestore();
const TARGET_UID = process.env.SEED_UID || 'demo_ev_umay_app';

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

async function seed() {
  const userDoc = db.collection('users').doc(TARGET_UID);
  const now = new Date().toISOString();

  const locations = [
    { id: 'loc_ev', name: 'Ev', parentId: null, path: ['Ev'] },
    { id: 'loc_mutfak', name: 'Mutfak', parentId: 'loc_ev', path: ['Ev', 'Mutfak'] },
    { id: 'loc_ust', name: 'Üst Dolap', parentId: 'loc_mutfak', path: ['Ev', 'Mutfak', 'Üst Dolap'] },
    { id: 'loc_alt', name: 'Alt Dolap', parentId: 'loc_mutfak', path: ['Ev', 'Mutfak', 'Alt Dolap'] },
    { id: 'loc_kiler', name: 'Kiler', parentId: 'loc_mutfak', path: ['Ev', 'Mutfak', 'Kiler'] },
    { id: 'loc_calisma', name: 'Çalışma Odası', parentId: 'loc_ev', path: ['Ev', 'Çalışma Odası'] },
    { id: 'loc_banyo', name: 'Banyo', parentId: 'loc_ev', path: ['Ev', 'Banyo'] },
  ];

  for (const loc of locations) {
    await userDoc.collection('locations').doc(loc.id).set({
      ...loc,
      createdAt: now,
      updatedAt: now,
    });
  }

  const categories = [
    {
      id: 'cat_mutfak',
      name: 'Mutfak',
      colorToken: 'emerald',
      icon: 'boxes',
      customFields: [{ key: 'skt_notu', label: 'Saklama Koşulu', type: 'text' }],
    },
    {
      id: 'cat_elektronik',
      name: 'Elektronik',
      colorToken: 'umay-blue',
      icon: 'boxes',
      customFields: [{ key: 'seri_no', label: 'Seri No', type: 'text' }],
    },
    {
      id: 'cat_kablo',
      name: 'Kablo & Aksesuar',
      colorToken: 'amber',
      icon: 'boxes',
      customFields: [
        { key: 'konnektor', label: 'Konnektör', type: 'text' },
        { key: 'uzunluk', label: 'Uzunluk (m)', type: 'number' },
      ],
    },
    {
      id: 'cat_temizlik',
      name: 'Temizlik & Banyo',
      colorToken: 'violet',
      icon: 'boxes',
      customFields: [],
    },
  ];

  for (const cat of categories) {
    await userDoc.collection('categories').doc(cat.id).set({
      ...cat,
      createdAt: now,
      updatedAt: now,
    });
  }

  const itemNames = [
    ['Spagetti Makarna (500g)', 'cat_mutfak', 'loc_kiler', 'consumable', 4, 'paket', 2],
    ['Sızma Zeytinyağı (1L)', 'cat_mutfak', 'loc_kiler', 'consumable', 1, 'lt', 2, daysFromNow(10)],
    ['Kırmızı Mercimek (1kg)', 'cat_mutfak', 'loc_kiler', 'consumable', 2, 'paket', 1],
    ['Filtre Kahve (250g)', 'cat_mutfak', 'loc_ust', 'consumable', 1, 'paket', 2, daysFromNow(12)],
    ['AA Alkalin Pil (4lü)', 'cat_kablo', 'loc_calisma', 'consumable', 1, 'paket', 2],
    ['AAA Alkalin Pil (4lü)', 'cat_kablo', 'loc_calisma', 'consumable', 3, 'paket', 1],
    ['USB-C 100W Kablo (2m)', 'cat_kablo', 'loc_calisma', 'durable', 3, 'adet', 1],
    ['HDMI 2.1 Kablo (2m)', 'cat_kablo', 'loc_calisma', 'durable', 2, 'adet', 1],
    ['65W GaN Şarj Adaptörü', 'cat_elektronik', 'loc_calisma', 'durable', 2, 'adet', 1],
    ['Su Arıtma Cihazı', 'cat_elektronik', 'loc_alt', 'durable', 1, 'adet', 0],
    ['Robot Süpürge', 'cat_elektronik', 'loc_ev', 'durable', 1, 'adet', 0],
    ['Su Arıtma Karbon Filtresi', 'cat_temizlik', 'loc_alt', 'component', 1, 'adet', 1],
    ['Diş Fırçası Yedek Başlığı', 'cat_temizlik', 'loc_banyo', 'component', 2, 'adet', 1],
    ['Bulaşık Makinesi Tableti', 'cat_temizlik', 'loc_alt', 'consumable', 1, 'kutu', 1],
    ['Çamaşır Deterjanı (3L)', 'cat_temizlik', 'loc_banyo', 'consumable', 2, 'adet', 1],
  ] as const;

  for (let idx = 0; idx < itemNames.length; idx += 1) {
    const [name, categoryId, locationId, type, quantity, unit, minQuantity, expiresAt] =
      itemNames[idx];
    const id = `itm_seed_${idx + 1}`;
    await userDoc.collection('items').doc(id).set({
      id,
      name,
      categoryId,
      locationId,
      type,
      quantity,
      unit,
      minQuantity,
      currency: 'TRY',
      expiresAt: expiresAt ?? null,
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  // Add 25 more pantry/home items to reach ~40 items
  for (let i = 16; i <= 40; i += 1) {
    const id = `itm_seed_${i}`;
    await userDoc.collection('items').doc(id).set({
      id,
      name: `Ev Stoğu Ürünü #${i}`,
      categoryId: i % 2 === 0 ? 'cat_mutfak' : 'cat_kablo',
      locationId: i % 2 === 0 ? 'loc_kiler' : 'loc_calisma',
      type: 'consumable',
      quantity: (i % 5) + 1,
      unit: 'adet',
      minQuantity: 1,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  const parts = [
    { id: 'prt_1', name: 'Su Arıtma Ön Tortu Filtresi', parentItemId: 'itm_seed_10', spareItemId: 'itm_seed_12', days: 180, installedDaysAgo: 190 },
    { id: 'prt_2', name: 'Su Arıtma Karbon Filtresi', parentItemId: 'itm_seed_10', spareItemId: 'itm_seed_12', days: 180, installedDaysAgo: 175 },
    { id: 'prt_3', name: 'Su Arıtma Membran Filtre', parentItemId: 'itm_seed_10', spareItemId: null, days: 365, installedDaysAgo: 120 },
    { id: 'prt_4', name: 'Diş Fırçası Başlığı', parentItemId: null, spareItemId: 'itm_seed_13', days: 90, installedDaysAgo: 86 },
    { id: 'prt_5', name: 'Robot Süpürge HEPA Filtre', parentItemId: 'itm_seed_11', spareItemId: null, days: 90, installedDaysAgo: 95 },
    { id: 'prt_6', name: 'Robot Süpürge Yan Fırça', parentItemId: 'itm_seed_11', spareItemId: null, days: 120, installedDaysAgo: 40 },
    { id: 'prt_7', name: 'Yazıcı Siyah Kartuş', parentItemId: null, spareItemId: null, days: 180, installedDaysAgo: 60 },
    { id: 'prt_8', name: 'Duman Dedektörü Pili', parentItemId: null, spareItemId: 'itm_seed_5', days: 365, installedDaysAgo: 360 },
    { id: 'prt_9', name: 'Kahve Makinesi Kireç Çözme', parentItemId: null, spareItemId: null, days: 60, installedDaysAgo: 58 },
    { id: 'prt_10', name: 'Klima Toz Filtresi Temizliği', parentItemId: null, spareItemId: null, days: 90, installedDaysAgo: 30 },
  ];

  for (const p of parts) {
    const installedAt = daysAgo(p.installedDaysAgo);
    const nextReplacementAt = daysFromNow(p.days - p.installedDaysAgo);
    const remaining = p.days - p.installedDaysAgo;
    const status = remaining <= 0 ? 'overdue' : remaining <= 7 ? 'due_soon' : 'ok';
    await userDoc.collection('parts').doc(p.id).set({
      id: p.id,
      name: p.name,
      parentItemId: p.parentItemId,
      spareItemId: p.spareItemId,
      lifespan: { mode: 'time', days: p.days },
      installedAt,
      usageCurrent: 0,
      nextReplacementAt,
      reminderLeadDays: 7,
      status,
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`Seeded 7 locations, 4 categories, 40 items, 10 parts for uid=${TARGET_UID}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
