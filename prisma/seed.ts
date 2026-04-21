import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding data...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ── 1. Super Admin ───────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@dibisnis.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@dibisnis.in',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // ── 2. UMKM 1: Warung Makan Bu Sari ─────────────────────────────────────────
  const umkm1 = await prisma.umkm.upsert({
    where: { slug: 'warung-bu-sari' },
    update: {},
    create: {
      name: 'Warung Makan Bu Sari',
      slug: 'warung-bu-sari',
      description: 'Menyediakan masakan rumahan yang enak, bersih, dan harga terjangkau. Cocok untuk makan siang & malam.',
      phone: '081234567890',
      openHours: '07.00 – 21.00',
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@busari.com' },
    update: {},
    create: {
      name: 'Bu Sari',
      email: 'owner@busari.com',
      password: hashedPassword,
      role: Role.OWNER,
      umkmId: umkm1.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'kasir@busari.com' },
    update: {},
    create: {
      name: 'Kasir Bu Sari',
      email: 'kasir@busari.com',
      password: hashedPassword,
      role: Role.KASIR,
      umkmId: umkm1.id,
    },
  });

  const products1Raw = [
    { name: 'Nasi Goreng Spesial',  category: 'Makanan',  price: 20000, costPrice: 12000, stock: 50 },
    { name: 'Ayam Bakar Madu',      category: 'Makanan',  price: 25000, costPrice: 15000, stock: 40 },
    { name: 'Soto Ayam Kampung',    category: 'Makanan',  price: 15000, costPrice: 9000,  stock: 30 },
    { name: 'Mie Goreng Jawa',      category: 'Makanan',  price: 18000, costPrice: 10000, stock: 40 },
    { name: 'Es Teh Manis',         category: 'Minuman',  price: 5000,  costPrice: 2000,  stock: 100 },
    { name: 'Es Jeruk Peras',       category: 'Minuman',  price: 7000,  costPrice: 3000,  stock: 80 },
    { name: 'Kopi Hitam',           category: 'Minuman',  price: 6000,  costPrice: 2500,  stock: 50 },
    { name: 'Kerupuk Udang',        category: 'Snack',    price: 3000,  costPrice: 1500,  stock: 200 },
  ];

  const existingP1 = await prisma.product.findMany({ where: { umkmId: umkm1.id } });
  const createdProducts1 = existingP1.length > 0
    ? existingP1
    : await Promise.all(products1Raw.map(p => prisma.product.create({ data: { ...p, umkmId: umkm1.id } })));

  // ── 3. UMKM 2: Kafe Kopi Nusantara ──────────────────────────────────────────
  const umkm2 = await prisma.umkm.upsert({
    where: { slug: 'kafe-kopi-nusantara' },
    update: {},
    create: {
      name: 'Kafe Kopi Nusantara',
      slug: 'kafe-kopi-nusantara',
      description: 'Kopi pilihan dari seluruh Nusantara — Aceh, Toraja, Flores, hingga Papua. Nikmati dalam suasana cozy.',
      phone: '081987654321',
      openHours: '09.00 – 23.00',
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@kopinusantara.com' },
    update: {},
    create: {
      name: 'Andi Prasetyo',
      email: 'owner@kopinusantara.com',
      password: hashedPassword,
      role: Role.OWNER,
      umkmId: umkm2.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'kasir@kopinusantara.com' },
    update: {},
    create: {
      name: 'Kasir Kopi Nusantara',
      email: 'kasir@kopinusantara.com',
      password: hashedPassword,
      role: Role.KASIR,
      umkmId: umkm2.id,
    },
  });

  const products2Raw = [
    { name: 'Espresso',         category: 'Kopi',      price: 18000, costPrice: 8000,  stock: 100 },
    { name: 'Cappuccino',       category: 'Kopi',      price: 25000, costPrice: 12000, stock: 80 },
    { name: 'V60 Arabica',      category: 'Kopi Manual', price: 28000, costPrice: 14000, stock: 50 },
    { name: 'Matcha Latte',     category: 'Non-Kopi',  price: 26000, costPrice: 13000, stock: 60 },
    { name: 'Red Velvet Latte', category: 'Non-Kopi',  price: 24000, costPrice: 11000, stock: 60 },
    { name: 'Croissant Butter', category: 'Pastry',    price: 20000, costPrice: 12000, stock: 30 },
    { name: 'Pain au Chocolat', category: 'Pastry',    price: 22000, costPrice: 13000, stock: 25 },
    { name: 'French Fries',     category: 'Snack',     price: 18000, costPrice: 8000,  stock: 50 },
  ];

  const existingP2 = await prisma.product.findMany({ where: { umkmId: umkm2.id } });
  const createdProducts2 = existingP2.length > 0
    ? existingP2
    : await Promise.all(products2Raw.map(p => prisma.product.create({ data: { ...p, umkmId: umkm2.id } })));

  // ── 4. Generate Transactions (only if none yet) ───────────────────────────────
  const generateTransactions = async (umkmId: string, products: typeof createdProducts1) => {
    const existing = await prisma.transaction.count({ where: { umkmId } });
    if (existing > 0) {
      console.log(`  Transaksi untuk ${umkmId} sudah ada, skip.`);
      return;
    }

    const today = new Date();
    const paymentMethods = ['CASH', 'QRIS', 'TRANSFER'];

    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const txDate = new Date(today);
      txDate.setDate(today.getDate() - daysAgo);
      // Jam realistis 07:00 – 21:00
      txDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);

      const numItems = 1 + Math.floor(Math.random() * 3);
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numItems);

      let totalAmount = 0;
      const itemsData = selected.map(product => {
        const qty = 1 + Math.floor(Math.random() * 2);
        totalAmount += product.price * qty;
        return { productId: product.id, qty, price: product.price };
      });

      await prisma.transaction.create({
        data: {
          totalAmount,
          paymentMethod: paymentMethods[Math.floor(Math.random() * 3)],
          umkmId,
          createdAt: txDate,
          items: { create: itemsData },
        },
      });
    }
    console.log(`  ✓ 30 transaksi untuk ${umkmId}`);
  };

  await generateTransactions(umkm1.id, createdProducts1);
  await generateTransactions(umkm2.id, createdProducts2);

  console.log('✅ Seeding selesai!');
  console.log('');
  console.log('📋 Akun Demo:');
  console.log('  Super Admin : admin@dibisnis.in         / admin123');
  console.log('  Owner 1     : owner@busari.com          / admin123');
  console.log('  Kasir 1     : kasir@busari.com          / admin123');
  console.log('  Owner 2     : owner@kopinusantara.com   / admin123');
  console.log('  Kasir 2     : kasir@kopinusantara.com   / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
