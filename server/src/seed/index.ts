import bcrypt from 'bcryptjs';
import { db, initDatabase, queryHelpers, generateUUID, safeJsonStringify } from '../db';

export async function runSeed() {
  initDatabase();

  const count = queryHelpers.getOne<any>('SELECT COUNT(*) as count FROM users');
  if (count && count.count > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('🌱 Seeding AgroDirect database with realistic Nigerian agricultural data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date().toISOString();
  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  // 1. Seed Categories
  const categories = [
    {
      id: generateUUID(),
      name: 'Poultry & Birds',
      slug: 'poultry-birds',
      icon: 'Egg',
      description: 'Live broilers, dressed chickens, layers, cockerels, turkey, fresh farm eggs',
      image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
      sort_order: 1
    },
    {
      id: generateUUID(),
      name: 'Livestock & Fish',
      slug: 'livestock-fish',
      icon: 'Fish',
      description: 'Point-and-kill catfish, tilapia, goats, rams, cattle, smoked fish',
      image_url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80',
      sort_order: 2
    },
    {
      id: generateUUID(),
      name: 'Tubers & Roots',
      slug: 'tubers-roots',
      icon: 'Layers',
      description: 'Premium white yam, water yam, sweet potato, cassava tubers, cocoyam',
      image_url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698980?auto=format&fit=crop&w=600&q=80',
      sort_order: 3
    },
    {
      id: generateUUID(),
      name: 'Fruits & Plantain',
      slug: 'fruits-plantain',
      icon: 'Apple',
      description: 'Giant plantain bunches, sweet pineapples, watermelons, citrus, pawpaw',
      image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      sort_order: 4
    },
    {
      id: generateUUID(),
      name: 'Vegetables & Peppers',
      slug: 'vegetables-peppers',
      icon: 'Salad',
      description: 'Fresh farm tomatoes, habanero (rodo), tatashe, fluted pumpkin (ugwu), bitter leaf',
      image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      sort_order: 5
    },
    {
      id: generateUUID(),
      name: 'Grains & Legumes',
      slug: 'grains-legumes',
      icon: 'Wheat',
      description: 'Abakaliki stone-free parboiled rice, honey beans (oloyin), white beans, yellow maize',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      sort_order: 6
    }
  ];

  for (const cat of categories) {
    queryHelpers.execute(
      `INSERT INTO categories (id, name, slug, icon, description, image_url, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [cat.id, cat.name, cat.slug, cat.icon, cat.description, cat.image_url, cat.sort_order, now]
    );
  }

  // 2. Seed Logistics Routes
  const routes = [
    { origin: 'Abia', dest: 'Lagos', base: 8500, perKg: 350, coldSurcharge: 6000, days: 2 },
    { origin: 'Abia', dest: 'Rivers', base: 4500, perKg: 200, coldSurcharge: 3500, days: 1 },
    { origin: 'Abia', dest: 'Enugu', base: 3500, perKg: 180, coldSurcharge: 3000, days: 1 },
    { origin: 'Abia', dest: 'FCT', base: 9000, perKg: 400, coldSurcharge: 7000, days: 2 },
    { origin: 'Enugu', dest: 'Lagos', base: 8000, perKg: 350, coldSurcharge: 5500, days: 2 },
    { origin: 'Anambra', dest: 'Lagos', base: 8000, perKg: 350, coldSurcharge: 5500, days: 2 },
    { origin: 'Lagos', dest: 'Lagos', base: 2500, perKg: 150, coldSurcharge: 2500, days: 1 },
    { origin: 'Abia', dest: 'Abia', base: 2000, perKg: 120, coldSurcharge: 2000, days: 1 }
  ];

  for (const r of routes) {
    queryHelpers.execute(
      `INSERT INTO logistics_routes (id, origin_state, destination_state, base_price, per_kg_rate, cold_chain_surcharge, estimated_transit_days, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [generateUUID(), r.origin, r.dest, r.base, r.perKg, r.coldSurcharge, r.days, now, now]
    );
  }

  // 3. Seed Users
  // Super Admin
  const adminId = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'admin@agrodirect.ng', ?, 'Emeka Okonkwo (Admin)', '+2348031234567', 'SUPER_ADMIN', 1, ?, ?)`,
    [adminId, passwordHash, now, now]
  );

  // Logistics Provider
  const logisticsUserId = generateUUID();
  const logisticsProviderId = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'logistics@agrodirect.ng', ?, 'SwiftAgro Logistics Inter-State', '+2348098765432', 'LOGISTICS_PROVIDER', 1, ?, ?)`,
    [logisticsUserId, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO logistics_providers (id, user_id, company_name, phone, email, status, created_at)
     VALUES (?, ?, 'SwiftAgro Inter-State Express', '+2348098765432', 'logistics@agrodirect.ng', 'VERIFIED', ?)`,
    [logisticsProviderId, logisticsUserId, now]
  );

  queryHelpers.execute(
    `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
     VALUES (?, ?, 'LOGISTICS', 145000, 35000, 320000, 140000, ?, ?)`,
    [generateUUID(), logisticsUserId, now, now]
  );

  // Vehicles
  const vehicle1Id = generateUUID();
  const vehicle2Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO vehicles (id, provider_id, vehicle_type, plate_number, max_weight_kg, has_refrigeration, status, created_at)
     VALUES (?, ?, 'REFRIGERATED_TRUCK', 'ABA-482-XA', 5000, 1, 'AVAILABLE', ?)`,
    [vehicle1Id, logisticsProviderId, now]
  );
  queryHelpers.execute(
    `INSERT INTO vehicles (id, provider_id, vehicle_type, plate_number, max_weight_kg, has_refrigeration, status, created_at)
     VALUES (?, ?, 'VAN', 'LSR-291-JJ', 2000, 0, 'IN_TRANSIT', ?)`,
    [vehicle2Id, logisticsProviderId, now]
  );

  // Customer (Lagos Buyer)
  const customerId = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'customer@agrodirect.ng', ?, 'Dr. Babatunde Adeyemi', '+2348123456789', 'CUSTOMER', 1, ?, ?)`,
    [customerId, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO addresses (id, user_id, full_name, phone, street_address, state, lga, is_default, delivery_instructions, created_at)
     VALUES (?, ?, 'Dr. Babatunde Adeyemi', '+2348123456789', 'Plot 14, Admiralty Way, Lekki Phase 1', 'Lagos', 'Eti-Osa', 1, 'Ring bell at security gate. Cold storage available.', ?)`,
    [generateUUID(), customerId, now]
  );

  // Farmer 1: Obegu Integrated Farms (Abia)
  const farmer1Id = generateUUID();
  const farm1Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'obegu@agrodirect.ng', ?, 'Elder Chidiebere Nwachukwu', '+2348023456789', 'FARMER', 1, ?, ?)`,
    [farmer1Id, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO farms (
      id, farmer_id, farm_name, slug, state, lga, address, gps_lat, gps_lng,
      farm_size, farm_type, main_products, description, farm_photos, logo_url,
      rating, total_reviews, completed_orders, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm1Id,
      farmer1Id,
      'Obegu Integrated Farms',
      'obegu-integrated-farms',
      'Abia',
      'Ugwunagbo',
      'Km 12 Aba-Port Harcourt Expressway, Obegu',
      5.0321,
      7.3456,
      '50 Hectares Commercial Farm',
      'Poultry, Fish & Cassava Processing',
      'Broiler Chickens, Catfish, Processed Garri',
      'Premier commercial farm in Abia State providing organic poultry, fresh fish and agricultural produce directly to buyers across Nigeria.',
      safeJsonStringify([
        'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80'
      ]),
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      4.9,
      38,
      142,
      'VERIFIED',
      pastDate(90),
      now
    ]
  );

  queryHelpers.execute(
    `INSERT INTO farmer_verifications (
      id, farm_id, farmer_id, id_type, id_number, id_document_url, farm_documents,
      farm_photos, cooperative_info, bank_name, bank_account_number, bank_account_name,
      status, reviewed_by, reviewed_at, created_at, updated_at
    ) VALUES (?, ?, ?, 'NIN', '12938475829', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', ?, ?, 'Abia Commercial Poultry Association (Reg #ACPA/2018/042)', 'Zenith Bank', '1014829384', 'Obegu Integrated Agro Ltd', 'VERIFIED', ?, ?, ?, ?)`,
    [
      generateUUID(),
      farm1Id,
      farmer1Id,
      safeJsonStringify(['CAC Certificate RC-1849204', 'Abia State Ministry of Agriculture Vet Certificate']),
      safeJsonStringify(['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80']),
      adminId,
      pastDate(80),
      pastDate(90),
      pastDate(80)
    ]
  );

  queryHelpers.execute(
    `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
     VALUES (?, ?, 'FARMER', 380000, 45000, 1850000, 1425000, ?, ?)`,
    [generateUUID(), farmer1Id, now, now]
  );

  // Farmer 2: Green Valley Poultry (Abia)
  const farmer2Id = generateUUID();
  const farm2Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'greenvalley@agrodirect.ng', ?, 'Mrs. Ngozi Eke', '+2348056789012', 'FARMER', 1, ?, ?)`,
    [farmer2Id, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO farms (
      id, farmer_id, farm_name, slug, state, lga, address, gps_lat, gps_lng,
      farm_size, farm_type, main_products, description, farm_photos, logo_url,
      rating, total_reviews, completed_orders, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm2Id,
      farmer2Id,
      'Green Valley Poultry & Livestock',
      'green-valley-poultry',
      'Abia',
      'Isiala Ngwa North',
      'Green Valley Farm Road, Mbawsi',
      5.3821,
      7.4216,
      '25 Hectares',
      'Poultry & Layers Farm',
      'Farm Fresh Eggs, Broilers, Spent Layers',
      'Dedicated egg and broiler production facility supplying fresh farm eggs and poultry with cold chain distribution.',
      safeJsonStringify(['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80']),
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
      4.8,
      24,
      89,
      'VERIFIED',
      pastDate(60),
      now
    ]
  );

  queryHelpers.execute(
    `INSERT INTO farmer_verifications (
      id, farm_id, farmer_id, id_type, id_number, id_document_url, farm_documents,
      farm_photos, cooperative_info, bank_name, bank_account_number, bank_account_name,
      status, reviewed_by, reviewed_at, created_at, updated_at
    ) VALUES (?, ?, ?, 'VOTER_CARD', '90F1B283948', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', ?, ?, 'Isiala Ngwa Farmers Union', 'Access Bank', '0082918374', 'Ngozi Eke (Green Valley)', 'VERIFIED', ?, ?, ?, ?)`,
    [
      generateUUID(),
      farm2Id,
      farmer2Id,
      safeJsonStringify(['CAC Reg BN-2938491']),
      safeJsonStringify(['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80']),
      adminId,
      pastDate(50),
      pastDate(60),
      pastDate(50)
    ]
  );

  queryHelpers.execute(
    `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
     VALUES (?, ?, 'FARMER', 190000, 20000, 890000, 680000, ?, ?)`,
    [generateUUID(), farmer2Id, now, now]
  );

  // Farmer 3: Sunrise Agro Farm (Enugu)
  const farmer3Id = generateUUID();
  const farm3Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'sunrise@agrodirect.ng', ?, 'Engr. Kenechukwu Eze', '+2348078901234', 'FARMER', 1, ?, ?)`,
    [farmer3Id, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO farms (
      id, farmer_id, farm_name, slug, state, lga, address, gps_lat, gps_lng,
      farm_size, farm_type, main_products, description, farm_photos, logo_url,
      rating, total_reviews, completed_orders, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm3Id,
      farmer3Id,
      'Sunrise Agro Farm & Plantations',
      'sunrise-agro-farm',
      'Enugu',
      'Udi',
      '9 Hilltop Agricultural Layout, 9th Mile Corner',
      6.4231,
      7.3912,
      '40 Hectares',
      'Plantations & Grains',
      'Giant Plantains, White Yam, Yellow Maize',
      'Large plantation producing high grade white yams, plantain bunches and destoned parboiled rice.',
      safeJsonStringify(['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80']),
      'https://images.unsplash.com/photo-1590165482129-1b8b27698980?auto=format&fit=crop&w=600&q=80',
      5.0,
      19,
      65,
      'VERIFIED',
      pastDate(45),
      now
    ]
  );

  queryHelpers.execute(
    `INSERT INTO farmer_verifications (
      id, farm_id, farmer_id, id_type, id_number, id_document_url, farm_documents,
      farm_photos, cooperative_info, bank_name, bank_account_number, bank_account_name,
      status, reviewed_by, reviewed_at, created_at, updated_at
    ) VALUES (?, ?, ?, 'DRIVERS_LICENSE', 'ENU-82910-AA', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', ?, ?, 'Enugu State Agricultural Cooperative', 'First Bank of Nigeria', '2019482710', 'Sunrise Agro Farms Ltd', 'VERIFIED', ?, ?, ?, ?)`,
    [
      generateUUID(),
      farm3Id,
      farmer3Id,
      safeJsonStringify(['CAC Certificate RC-3019284']),
      safeJsonStringify(['https://images.unsplash.com/photo-1590165482129-1b8b27698980?auto=format&fit=crop&w=800&q=80']),
      adminId,
      pastDate(40),
      pastDate(45),
      pastDate(40)
    ]
  );

  queryHelpers.execute(
    `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
     VALUES (?, ?, 'FARMER', 240000, 0, 720000, 480000, ?, ?)`,
    [generateUUID(), farmer3Id, now, now]
  );

  // Farmer 4: New Dawn Agro (Under Review Demo)
  const farmer4Id = generateUUID();
  const farm4Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
     VALUES (?, 'newfarmer@agrodirect.ng', ?, 'Ifeanyi Uche', '+2348091283746', 'FARMER', 1, ?, ?)`,
    [farmer4Id, passwordHash, now, now]
  );

  queryHelpers.execute(
    `INSERT INTO farms (
      id, farmer_id, farm_name, slug, state, lga, address, gps_lat, gps_lng,
      farm_size, farm_type, main_products, description, farm_photos, logo_url,
      rating, total_reviews, completed_orders, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farm4Id,
      farmer4Id,
      'New Dawn Organic Farms',
      'new-dawn-organic-farms',
      'Abia',
      'Umuahia North',
      'Plot 8 Agbama Housing Estate Extension, Umuahia',
      5.5241,
      7.4892,
      '15 Hectares Organic Farm',
      'Vegetables & Snails',
      'Ugwu Vegetables, Scent Leaf, Giant African Snails',
      'Eco-friendly farm specializing in fresh organic vegetables and heliciculture (snail farming).',
      safeJsonStringify([]),
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      0,
      0,
      0,
      'UNDER_REVIEW',
      pastDate(2),
      now
    ]
  );

  queryHelpers.execute(
    `INSERT INTO farmer_verifications (
      id, farm_id, farmer_id, id_type, id_number, id_document_url, farm_documents,
      farm_photos, cooperative_info, bank_name, bank_account_number, bank_account_name,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, 'NIN', '92837461029', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', ?, ?, 'Umuahia Organic Farmers Alliance', 'Guaranty Trust Bank (GTB)', '0129384756', 'Ifeanyi Uche Enterprises', 'UNDER_REVIEW', ?, ?)`,
    [
      generateUUID(),
      farm4Id,
      farmer4Id,
      safeJsonStringify(['Umuahia LGA Business Permit']),
      safeJsonStringify(['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80']),
      pastDate(2),
      now
    ]
  );

  queryHelpers.execute(
    `INSERT INTO wallets (id, user_id, role, available_balance, pending_balance, total_earnings, total_withdrawals, created_at, updated_at)
     VALUES (?, ?, 'FARMER', 0, 0, 0, 0, ?, ?)`,
    [generateUUID(), farmer4Id, now, now]
  );

  // 4. Seed Products
  const catPoultry = categories.find(c => c.slug === 'poultry-birds')!.id;
  const catLivestock = categories.find(c => c.slug === 'livestock-fish')!.id;
  const catTubers = categories.find(c => c.slug === 'tubers-roots')!.id;
  const catFruits = categories.find(c => c.slug === 'fruits-plantain')!.id;
  const catVeg = categories.find(c => c.slug === 'vegetables-peppers')!.id;
  const catGrains = categories.find(c => c.slug === 'grains-legumes')!.id;

  const products = [
    {
      farm_id: farm1Id,
      farmer_id: farmer1Id,
      category_id: catPoultry,
      name: 'Fresh Jumbo Broiler Chicken (2.5kg - 3.0kg)',
      slug: 'fresh-jumbo-broiler-chicken-2-5kg',
      description: 'Healthy, organically grain-fed live or dressed broiler chickens raised in hygienic conditions in Obegu, Abia State. Packaged in temperature-controlled thermal bags with dry ice ready for inter-state transit to Lagos.',
      price: 8500,
      unit: 'Bird',
      min_qty: 2,
      inventory: 350,
      packaging_fee: 500,
      is_perishable: 1,
      cold_chain_required: 1,
      images: [
        'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        breed: 'Cobb 500 Fast-Growing Broiler',
        age: '8 Weeks Maturity',
        processing_option: 'Available Live or Clean Dressed & Vacuum-Sealed',
        average_weight: '2.8 Kg per bird',
        feed_type: '100% Maize & Soy Organic Feed (No chemical steroids)'
      }
    },
    {
      farm_id: farm2Id,
      farmer_id: farmer2Id,
      category_id: catPoultry,
      name: 'Fresh Farm Table Eggs (Jumbo Size)',
      slug: 'fresh-farm-table-eggs-jumbo-crate',
      description: 'Freshly collected golden yolk eggs from healthy ISA Brown layers. Cleaned, sorted and cushioned in durable pulp crates to prevent breakage during inter-state haulage.',
      price: 4600,
      unit: 'Crate',
      min_qty: 5,
      inventory: 500,
      packaging_fee: 200,
      is_perishable: 1,
      cold_chain_required: 0,
      images: [
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        grade: 'Grade A Jumbo',
        units_per_crate: '30 Eggs per Crate',
        egg_color: 'Rich Brown with Golden Yolk',
        collection_frequency: 'Daily Fresh Morning Collection'
      }
    },
    {
      farm_id: farm1Id,
      farmer_id: farmer1Id,
      category_id: catLivestock,
      name: 'Live African Point-and-Kill Catfish (1.2kg - 1.8kg)',
      slug: 'live-african-point-and-kill-catfish',
      description: 'Fresh live Clarias gariepinus catfish harvested directly from our freshwater concrete ponds in Obegu. Can be shipped live in oxygenated tanks or oven-smoked and vacuum-packed.',
      price: 3400,
      unit: 'Kg',
      min_qty: 3,
      inventory: 400,
      packaging_fee: 400,
      is_perishable: 1,
      cold_chain_required: 1,
      images: [
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        species: 'Clarias gariepinus (African Sharptooth Catfish)',
        water_source: 'Pure Underground Borehole Freshwater',
        state_condition: 'Live in Oxygen Bags or Fresh Iced Cutlets'
      }
    },
    {
      farm_id: farm3Id,
      farmer_id: farmer3Id,
      category_id: catTubers,
      name: 'Premium White Yam Tubers (Abakaliki / Udi Variety)',
      slug: 'premium-white-yam-tubers-large',
      description: 'Sweet, dry and perfectly poundable white yam tubers harvested from the fertile soils of Udi, Enugu. Well-cured and resistant to rot during long transit.',
      price: 3200,
      unit: 'Piece',
      min_qty: 3,
      inventory: 600,
      packaging_fee: 100,
      is_perishable: 0,
      cold_chain_required: 0,
      images: [
        'https://images.unsplash.com/photo-1590165482129-1b8b27698980?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        variety: 'White Yam (Dioscorea rotundata)',
        average_weight: '4.5 Kg - 5.5 Kg per tuber',
        culinary_best_for: 'Pounded Yam, Boiled Yam, Crispy Fried Yam'
      }
    },
    {
      farm_id: farm3Id,
      farmer_id: farmer3Id,
      category_id: catFruits,
      name: 'Giant Organic Plantain Bunches (Unripe / Semi-Ripe)',
      slug: 'giant-organic-plantain-bunches',
      description: 'Massive organic plantain bunches grown without synthetic pesticides. Perfect for dodo, plantain flour, boli, or chips.',
      price: 6500,
      unit: 'Bunch',
      min_qty: 1,
      inventory: 150,
      packaging_fee: 300,
      is_perishable: 1,
      cold_chain_required: 0,
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        fingers_per_bunch: '35 - 50 Healthy Large Fingers',
        ripeness_stage: 'Unripe Green (Travel Friendly) or Turning Yellow'
      }
    },
    {
      farm_id: farm1Id,
      farmer_id: farmer1Id,
      category_id: catVeg,
      name: 'Fresh Farm Tomatoes (Large Raffia Basket)',
      slug: 'fresh-farm-tomatoes-raffia-basket',
      description: 'Plump, firm and juicy red tomatoes harvested at early dawn. Packed in well-aerated raffia baskets to prevent squishing during transit.',
      price: 28000,
      unit: 'Basket',
      min_qty: 1,
      inventory: 80,
      packaging_fee: 1000,
      is_perishable: 1,
      cold_chain_required: 1,
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        variety: 'Roma / UTC Hybrid',
        basket_weight: 'Approximately 45 - 50 Kg',
        firmness: 'High Firmness (Long Shelf Life)'
      }
    },
    {
      farm_id: farm3Id,
      farmer_id: farmer3Id,
      category_id: catGrains,
      name: 'Abakaliki Premium Stone-Free Parboiled Rice (50kg Bag)',
      slug: 'abakaliki-premium-parboiled-rice-50kg',
      description: 'Authentic 100% stone-free, polished indigenous Nigerian long-grain rice. High nutritional retention and delicious natural aroma.',
      price: 78000,
      unit: 'Bag',
      min_qty: 1,
      inventory: 200,
      packaging_fee: 500,
      is_perishable: 0,
      cold_chain_required: 0,
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        grain_type: 'Long Grain Parboiled',
        stone_free_guarantee: '100% Destoned & Optical Color Sorted',
        weight: '50.0 Kg Net Weight'
      }
    },
    {
      farm_id: farm2Id,
      farmer_id: farmer2Id,
      category_id: catGrains,
      name: 'Sweet Honey Beans / Oloyin (50kg Bag)',
      slug: 'sweet-honey-beans-oloyin-50kg-bag',
      description: 'Naturally sweet, pesticide-free honey beans (Oloyin) cleanly threshed and bagged. Cooks tender and delicious in minimal time.',
      price: 85000,
      unit: 'Bag',
      min_qty: 1,
      inventory: 120,
      packaging_fee: 500,
      is_perishable: 0,
      cold_chain_required: 0,
      images: [
        'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80'
      ],
      attributes: {
        variety: 'Phaseolus vulgaris (Sweet Honey / Oloyin)',
        weevil_status: 'Naturally Preserved (No harmful chemical dust)',
        weight: '50 Kg Bag'
      }
    }
  ];

  const createdProductIds: string[] = [];
  for (const p of products) {
    const prodId = generateUUID();
    createdProductIds.push(prodId);
    queryHelpers.execute(
      `INSERT INTO products (
        id, farm_id, farmer_id, category_id, name, slug, description, price, currency, unit,
        minimum_quantity, inventory, packaging_fee, is_perishable, cold_chain_required,
        status, images, attributes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NGN', ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)`,
      [
        prodId,
        p.farm_id,
        p.farmer_id,
        p.category_id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.unit,
        p.min_qty,
        p.inventory,
        p.packaging_fee,
        p.is_perishable,
        p.cold_chain_required,
        safeJsonStringify(p.images),
        safeJsonStringify(p.attributes),
        pastDate(30),
        now
      ]
    );

    queryHelpers.execute(
      `INSERT INTO inventory_movements (id, product_id, change_amount, reason, reference_id, created_at)
       VALUES (?, ?, ?, 'RESTOCK', 'INITIAL_SEED', ?)`,
      [generateUUID(), prodId, p.inventory, pastDate(30)]
    );
  }

  // 5. Seed Realistic Demo Orders, Shipments & Reviews
  // Order 1: Completed Order (Abia Obegu Chickens -> Lagos Customer)
  const order1Id = generateUUID();
  const subtotal1 = 8500 * 4; // ₦34,000 (4 birds)
  const pkg1 = 500 * 4; // ₦2,000
  const log1 = 8500 + (4 * 2.8 * 350) + 6000; // ₦18,420
  const plat1 = Math.round((subtotal1 + pkg1) * 0.05); // ₦1,800
  const total1 = subtotal1 + pkg1 + log1 + plat1;

  queryHelpers.execute(
    `INSERT INTO orders (id, order_number, customer_id, farm_id, farmer_id, subtotal, packaging_fee, logistics_fee, platform_fee, discount, total_amount, status, delivery_address, delivery_instructions, created_at, updated_at)
     VALUES (?, 'AGD-2026-849102', ?, ?, ?, ?, ?, ?, ?, 0, ?, 'COMPLETED', ?, 'Call before arrival. Deliver to gate.', ?, ?)`,
    [
      order1Id,
      customerId,
      farm1Id,
      farmer1Id,
      subtotal1,
      pkg1,
      log1,
      plat1,
      total1,
      safeJsonStringify({
        full_name: 'Dr. Babatunde Adeyemi',
        phone: '+2348123456789',
        street_address: 'Plot 14, Admiralty Way, Lekki Phase 1',
        state: 'Lagos',
        lga: 'Eti-Osa'
      }),
      pastDate(10),
      pastDate(8)
    ]
  );

  queryHelpers.execute(
    `INSERT INTO order_items (id, order_id, product_id, product_name, unit, price, quantity, total_price, product_attributes, created_at)
     VALUES (?, ?, ?, 'Fresh Jumbo Broiler Chicken (2.5kg - 3.0kg)', 'Bird', 8500, 4, 34000, ?, ?)`,
    [generateUUID(), order1Id, createdProductIds[0], safeJsonStringify({ processing_option: 'Clean Dressed & Vacuum-Sealed' }), pastDate(10)]
  );

  const shipment1Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO shipments (id, order_id, provider_id, vehicle_id, tracking_number, origin_state, destination_state, actual_delivery, status, proof_of_delivery_note, recipient_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'TRK-ABA-LOS-829104', 'Abia', 'Lagos', ?, 'DELIVERED', 'Delivered safely in cold ice box to Lekki gate. Received by security head.', 'Dr. Babatunde Adeyemi', ?, ?)`,
    [shipment1Id, order1Id, logisticsProviderId, vehicle1Id, pastDate(8), pastDate(10), pastDate(8)]
  );

  const deliveryEvents = [
    { status: 'ACCEPTED', note: 'SwiftAgro assigned truck ABA-482-XA for pickup from Obegu Farm, Abia.', days: 10 },
    { status: 'PICKED_UP', note: 'Broiler chicken order loaded in refrigerated cold-chain container at 4°C.', days: 9 },
    { status: 'IN_TRANSIT', note: 'Shipment departed Aba inter-state depot heading along Benin-Ore expressway.', days: 9 },
    { status: 'OUT_FOR_DELIVERY', note: 'Driver arrived Lagos distribution hub. Out for delivery in Lekki Axis.', days: 8 },
    { status: 'DELIVERED', note: 'Customer confirmed complete delivery of 4 dressed broilers in perfect chilled condition.', days: 8 }
  ];

  for (const ev of deliveryEvents) {
    queryHelpers.execute(
      `INSERT INTO delivery_events (id, shipment_id, status, note, location, created_by, created_at)
       VALUES (?, ?, ?, ?, 'Abia-Lagos Corridor', 'SYSTEM', ?)`,
      [generateUUID(), shipment1Id, ev.status, ev.note, pastDate(ev.days)]
    );
  }

  // Settlement for Order 1 (PAID)
  queryHelpers.execute(
    `INSERT INTO settlements (id, order_id, farm_id, farmer_id, product_amount, packaging_amount, logistics_amount, platform_fee_amount, farmer_net_amount, status, eligible_at, paid_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?, ?, ?, ?)`,
    [
      generateUUID(),
      order1Id,
      farm1Id,
      farmer1Id,
      subtotal1,
      pkg1,
      log1,
      plat1,
      subtotal1 + pkg1,
      pastDate(8),
      pastDate(7),
      pastDate(10),
      pastDate(7)
    ]
  );

  // Review for Order 1
  queryHelpers.execute(
    `INSERT INTO reviews (id, order_id, customer_id, farm_id, product_id, rating, farmer_rating, logistics_rating, comment, photos, created_at)
     VALUES (?, ?, ?, ?, ?, 5, 5, 5, 'The broilers arrived in Lagos from Abia completely fresh and icy cold! Excellent packaging and rapid transit. I will be making this my regular weekly family supply.', ?, ?)`,
    [
      generateUUID(),
      order1Id,
      customerId,
      farm1Id,
      createdProductIds[0],
      safeJsonStringify(['https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80']),
      pastDate(7)
    ]
  );

  // Order 2: In-Transit Order (Abia Green Valley Eggs -> Lagos)
  const order2Id = generateUUID();
  const subtotal2 = 4600 * 10; // ₦46,000 (10 crates)
  const pkg2 = 200 * 10; // ₦2,000
  const log2 = 8500 + (10 * 1.5 * 350); // ₦13,750
  const plat2 = Math.round((subtotal2 + pkg2) * 0.05); // ₦2,400
  const total2 = subtotal2 + pkg2 + log2 + plat2;

  queryHelpers.execute(
    `INSERT INTO orders (id, order_number, customer_id, farm_id, farmer_id, subtotal, packaging_fee, logistics_fee, platform_fee, discount, total_amount, status, delivery_address, delivery_instructions, created_at, updated_at)
     VALUES (?, 'AGD-2026-918234', ?, ?, ?, ?, ?, ?, ?, 0, ?, 'IN_TRANSIT', ?, 'Handle with care: Fragile eggs', ?, ?)`,
    [
      order2Id,
      customerId,
      farm2Id,
      farmer2Id,
      subtotal2,
      pkg2,
      log2,
      plat2,
      total2,
      safeJsonStringify({
        full_name: 'Dr. Babatunde Adeyemi',
        phone: '+2348123456789',
        street_address: 'Plot 14, Admiralty Way, Lekki Phase 1',
        state: 'Lagos',
        lga: 'Eti-Osa'
      }),
      pastDate(1),
      now
    ]
  );

  const shipment2Id = generateUUID();
  queryHelpers.execute(
    `INSERT INTO shipments (id, order_id, provider_id, vehicle_id, tracking_number, origin_state, destination_state, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'TRK-ABA-LOS-918291', 'Abia', 'Lagos', 'IN_TRANSIT', ?, ?)`,
    [shipment2Id, order2Id, logisticsProviderId, vehicle2Id, pastDate(1), now]
  );

  queryHelpers.execute(
    `INSERT INTO delivery_events (id, shipment_id, status, note, location, created_by, created_at)
     VALUES (?, ?, 'IN_TRANSIT', 'Eggs crate cargo passed Ore transit tollgate. Approaching Lagos boundary.', 'Ondo-Ogun Corridor', 'SYSTEM', ?)`,
    [generateUUID(), shipment2Id, now]
  );

  queryHelpers.execute(
    `INSERT INTO settlements (id, order_id, farm_id, farmer_id, product_amount, packaging_amount, logistics_amount, platform_fee_amount, farmer_net_amount, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
    [generateUUID(), order2Id, farm2Id, farmer2Id, subtotal2, pkg2, log2, plat2, subtotal2 + pkg2, pastDate(1), now]
  );

  // Platform Settings
  const settings = [
    { key: 'platform_fee_percent', val: '5', desc: 'Marketplace transaction commission percentage' },
    { key: 'settlement_delay_hours', val: '24', desc: 'Hours after delivery before funds become withdrawable' },
    { key: 'min_withdrawal_amount', val: '5000', desc: 'Minimum withdrawal amount in NGN' },
    { key: 'support_phone', val: '+2348002476347', desc: 'AgroDirect 24/7 Helpline' },
    { key: 'support_email', val: 'support@agrodirect.ng', desc: 'Official customer and farmer support desk' }
  ];

  for (const s of settings) {
    queryHelpers.execute(
      `INSERT INTO platform_settings (id, key, value, description, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [generateUUID(), s.key, s.val, s.desc, adminId, now]
    );
  }

  console.log('✅ AgroDirect seed completed successfully!');
}
