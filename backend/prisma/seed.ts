import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated list of beauty & fashion products inspired by Myntra and Amazon datasets
const productsData = [
  // === SKINCARE ===
  { name: "Vitamin C Face Serum for Glowing Skin", category: "Skincare", brand: "Mamaearth", price: 599.00, rating: 4.3 },
  { name: "Revitalift Crystal Micro-Essence", category: "Skincare", brand: "L'Oreal Paris", price: 899.00, rating: 4.4 },
  { name: "Hydro Boost Water Gel Moisturizer", category: "Skincare", brand: "Neutrogena", price: 1050.00, rating: 4.5 },
  { name: "Salicylic Acid 2% Acne Serum", category: "Skincare", brand: "Minimalist", price: 499.00, rating: 4.2 },
  { name: "Green Tea Pore Cleansing Face Wash", category: "Skincare", brand: "Plum", price: 349.00, rating: 4.1 },
  { name: "Niacinamide 10% Corrective Serum", category: "Skincare", brand: "The Ordinary", price: 600.00, rating: 4.6 },
  { name: "Advanced Night Repair Synchronized Multi-Recovery", category: "Skincare", brand: "Estee Lauder", price: 5900.00, rating: 4.8 },
  { name: "Kumkumadi Miraculous Beauty Fluid", category: "Skincare", brand: "Kama Ayurveda", price: 2995.00, rating: 4.7 },
  { name: "Centella Green Level Eye Cream", category: "Skincare", brand: "Purito", price: 1250.00, rating: 4.3 },
  { name: "Rice Water Bright Foaming Cleanser", category: "Skincare", brand: "The Face Shop", price: 849.00, rating: 4.4 },
  { name: "Hydrating Facial Cleanser", category: "Skincare", brand: "CeraVe", price: 1150.00, rating: 4.6 },
  { name: "Snail 96 Mucin Power Essence", category: "Skincare", brand: "COSRX", price: 1450.00, rating: 4.7 },
  { name: "Watermelon Glow Pink Juice Moisturizer", category: "Skincare", brand: "Glow Recipe", price: 3200.00, rating: 4.5 },
  { name: "Daily Brightening Peel Pads", category: "Skincare", brand: "Dr. Dennis Gross", price: 4200.00, rating: 4.7 },
  { name: "Moisture Surge 100H Auto-Replenishing Hydrator", category: "Skincare", brand: "Clinique", price: 2700.00, rating: 4.6 },
  { name: "C-Firma Fresh Day Serum", category: "Skincare", brand: "Drunk Elephant", price: 6800.00, rating: 4.4 },
  { name: "The Water Cream", category: "Skincare", brand: "Tatcha", price: 5800.00, rating: 4.8 },
  { name: "Superfood Antioxidant Cleanser", category: "Skincare", brand: "Youth To The People", price: 2900.00, rating: 4.5 },
  { name: "Squalane + Vitamin C Rose Oil", category: "Skincare", brand: "Biossance", price: 5400.00, rating: 4.6 },
  { name: "Luminous Dewy Skin Mist", category: "Skincare", brand: "Tatcha", price: 4200.00, rating: 4.7 },

  // === MAKEUP ===
  { name: "SuperStay Matte Ink Liquid Lipstick", category: "Makeup", brand: "Maybelline New York", price: 699.00, rating: 4.2 },
  { name: "Fit Me Matte + Poreless Liquid Foundation", category: "Makeup", brand: "Maybelline New York", price: 549.00, rating: 4.1 },
  { name: "Matte Lipstick - Ruby Woo", category: "Makeup", brand: "M.A.C", price: 1950.00, rating: 4.7 },
  { name: "Kajal Magique Bold Black", category: "Makeup", brand: "L'Oreal Paris", price: 290.00, rating: 4.0 },
  { name: "Absolute Skin Natural Mousse Foundation", category: "Makeup", brand: "Lakme", price: 850.00, rating: 4.2 },
  { name: "Weightless Matte Finish Lipstick", category: "Makeup", brand: "Sugar Cosmetics", price: 399.00, rating: 4.1 },
  { name: "Lash Sensational Waterproof Mascara", category: "Makeup", brand: "Maybelline New York", price: 449.00, rating: 4.3 },
  { name: "Ultra HD Microfinishing Loose Powder", category: "Makeup", brand: "Make Up For Ever", price: 3200.00, rating: 4.6 },
  { name: "Cheek Heat Gel-Cream Blush", category: "Makeup", brand: "Maybelline New York", price: 475.00, rating: 4.0 },
  { name: "Orgasm Blush", category: "Makeup", brand: "NARS", price: 3100.00, rating: 4.8 },
  { name: "All Nighter Long-Lasting Makeup Setting Spray", category: "Makeup", brand: "Urban Decay", price: 2800.00, rating: 4.7 },
  { name: "Born This Way Super Coverage Concealer", category: "Makeup", brand: "Too Faced", price: 2400.00, rating: 4.5 },
  { name: "Double Wear Stay-in-Place Makeup", category: "Makeup", brand: "Estee Lauder", price: 4300.00, rating: 4.6 },
  { name: "Shape Tape Concealer", category: "Makeup", brand: "Tarte", price: 2600.00, rating: 4.5 },
  { name: "Gloss Bomb Universal Lip Luminizer", category: "Makeup", brand: "Fenty Beauty", price: 2100.00, rating: 4.7 },
  { name: "Translucent Loose Setting Powder", category: "Makeup", brand: "Laura Mercier", price: 3800.00, rating: 4.7 },
  { name: "Brow Wiz Mechanical Pencil", category: "Makeup", brand: "Anastasia Beverly Hills", price: 2200.00, rating: 4.6 },
  { name: "Backstage Eye Palette", category: "Makeup", brand: "Dior", price: 4900.00, rating: 4.8 },
  { name: "Ambient Lighting Powder", category: "Makeup", brand: "Hourglass", price: 4600.00, rating: 4.7 },
  { name: "Pore Professional Face Primer", category: "Makeup", brand: "Benefit Cosmetics", price: 3300.00, rating: 4.4 },

  // === HAIRCARE ===
  { name: "Total Repair 5 Repairing Shampoo", category: "Haircare", brand: "L'Oreal Paris", price: 329.00, rating: 4.2 },
  { name: "Onion Hair Fall Control Oil", category: "Haircare", brand: "Mamaearth", price: 419.00, rating: 4.0 },
  { name: "Argan Oil of Morocco Penetrating Treatment", category: "Haircare", brand: "OGX", price: 799.00, rating: 4.3 },
  { name: "Moroccanoil Treatment Original", category: "Haircare", brand: "Moroccanoil", price: 3150.00, rating: 4.7 },
  { name: "No. 3 Hair Perfector Repairing Treatment", category: "Haircare", brand: "Olaplex", price: 2950.00, rating: 4.6 },
  { name: "Scalp Advanced Anti-Dandruff Shampoo", category: "Haircare", brand: "L'Oreal Professionnel", price: 699.00, rating: 4.4 },
  { name: "Tea Tree Scalp Care Conditioner", category: "Haircare", brand: "Paul Mitchell", price: 1850.00, rating: 4.5 },
  { name: "Rosemary Mint Strengthening Hair Masque", category: "Haircare", brand: "Mielle Organics", price: 1250.00, rating: 4.5 },
  { name: "Glow & Shine Hair Serum", category: "Haircare", brand: "Livon", price: 250.00, rating: 3.9 },
  { name: "Banana Truly Nourishing Hair Mask", category: "Haircare", brand: "The Body Shop", price: 1550.00, rating: 4.2 },
  { name: "Absolut Repair Wheat Oil Hair Masque", category: "Haircare", brand: "L'Oreal Professionnel", price: 860.00, rating: 4.5 },
  { name: "No. 4 Bond Maintenance Shampoo", category: "Haircare", brand: "Olaplex", price: 2950.00, rating: 4.6 },
  { name: "No. 5 Bond Maintenance Conditioner", category: "Haircare", brand: "Olaplex", price: 2950.00, rating: 4.6 },
  { name: "Scalp Revival Charcoal + Coconut Micro-Exfoliating Shampoo", category: "Haircare", brand: "Briogeo", price: 3800.00, rating: 4.4 },
  { name: "Dry Shampoo Original", category: "Haircare", brand: "Batiste", price: 649.00, rating: 4.3 },
  { name: "Don't Despair, Repair! Deep Conditioning Mask", category: "Haircare", brand: "Briogeo", price: 3600.00, rating: 4.5 },
  { name: "Perfect Hair Day Dry Shampoo", category: "Haircare", brand: "Living Proof", price: 2600.00, rating: 4.5 },
  { name: "Botanical Repair Strengthening Leave-in Treatment", category: "Haircare", brand: "Aveda", price: 3200.00, rating: 4.6 },
  { name: "Sol de Janeiro Brazilian Joia Strengthening Shampoo", category: "Haircare", brand: "Sol de Janeiro", price: 2200.00, rating: 4.4 },
  { name: "Honey Infused Hair Oil", category: "Haircare", brand: "Gisou", price: 4200.00, rating: 4.3 },

  // === FRAGRANCE ===
  { name: "Hugo Man Eau De Toilette", category: "Fragrance", brand: "Hugo Boss", price: 4950.00, rating: 4.5 },
  { name: "Cool Water Men Eau De Toilette", category: "Fragrance", brand: "Davidoff", price: 4200.00, rating: 4.4 },
  { name: "Coco Mademoiselle Eau De Parfum", category: "Fragrance", brand: "Chanel", price: 11500.00, rating: 4.9 },
  { name: "Acqua Di Gio Eau De Toilette", category: "Fragrance", brand: "Giorgio Armani", price: 6500.00, rating: 4.7 },
  { name: "Black Opium Eau De Parfum", category: "Fragrance", brand: "Yves Saint Laurent", price: 8200.00, rating: 4.7 },
  { name: "Sauvage Eau De Parfum", category: "Fragrance", brand: "Dior", price: 9800.00, rating: 4.8 },
  { name: "Light Blue Eau De Toilette", category: "Fragrance", brand: "Dolce & Gabbana", price: 5400.00, rating: 4.5 },
  { name: "Flowerbomb Eau De Parfum", category: "Fragrance", brand: "Viktor & Rolf", price: 7800.00, rating: 4.7 },
  { name: "Bleu De Chanel Eau De Parfum", category: "Fragrance", brand: "Chanel", price: 12500.00, rating: 4.9 },
  { name: "One Million Eau De Toilette", category: "Fragrance", brand: "Paco Rabanne", price: 6200.00, rating: 4.6 },
  { name: "Brazilian Crush Cheirosa 68 Mist", category: "Fragrance", brand: "Sol de Janeiro", price: 2100.00, rating: 4.6 },
  { name: "Wood Sage & Sea Salt Cologne", category: "Fragrance", brand: "Jo Malone", price: 5600.00, rating: 4.7 },
  { name: "Replica By the Fireplace Eau de Toilette", category: "Fragrance", brand: "Maison Margiela", price: 8500.00, rating: 4.5 },
  { name: "Good Girl Eau de Parfum", category: "Fragrance", brand: "Carolina Herrera", price: 7400.00, rating: 4.7 },
  { name: "Daisy Eau de Toilette", category: "Fragrance", brand: "Marc Jacobs", price: 6500.00, rating: 4.6 },
  { name: "Lost Cherry Eau de Parfum", category: "Fragrance", brand: "Tom Ford", price: 28000.00, rating: 4.5 },
  { name: "Libre Eau de Parfum", category: "Fragrance", brand: "Yves Saint Laurent", price: 7600.00, rating: 4.7 },
  { name: "Aventus Eau de Parfum", category: "Fragrance", brand: "Creed", price: 29500.00, rating: 4.8 },
  { name: "Gyspy Water Eau de Parfum", category: "Fragrance", brand: "Byredo", price: 17500.00, rating: 4.4 },
  { name: "Tease Eau de Parfum", category: "Fragrance", brand: "Victoria's Secret", price: 5200.00, rating: 4.5 },

  // === FASHION ===
  { name: "Men Crew Neck Slim Fit T-Shirt", category: "Fashion", brand: "Zara", price: 1290.00, rating: 4.2 },
  { name: "Women Floral Print A-Line Dress", category: "Fashion", brand: "H&M", price: 2299.00, rating: 4.3 },
  { name: "Men Stretch Skinny Fit Jeans", category: "Fashion", brand: "Levis", price: 3499.00, rating: 4.4 },
  { name: "Women Ribbed Knit Cardigan", category: "Fashion", brand: "Zara", price: 2590.00, rating: 4.1 },
  { name: "Unisex Hooded Fleece Sweatshirt", category: "Fashion", brand: "Gap", price: 2999.00, rating: 4.3 },
  { name: "Women High-Waist Wide-Leg Trousers", category: "Fashion", brand: "Zara", price: 2990.00, rating: 4.2 },
  { name: "Men Solid Regular Bomber Jacket", category: "Fashion", brand: "H&M", price: 3999.00, rating: 4.3 },
  { name: "Women Satin Wrap Top", category: "Fashion", brand: "Mango", price: 1990.00, rating: 4.0 },
  { name: "Men Classic Linen Shirt", category: "Fashion", brand: "Marks & Spencer", price: 2799.00, rating: 4.4 },
  { name: "Women Plaid Pleated Skirt", category: "Fashion", brand: "Forever 21", price: 1499.00, rating: 3.9 },
  { name: "Air Force 1 '07 Sneakers", category: "Fashion", brand: "Nike", price: 7495.00, rating: 4.6 },
  { name: "Stan Smith Leather Sneakers", category: "Fashion", brand: "Adidas", price: 6999.00, rating: 4.5 },
  { name: "Women Denim Jacket", category: "Fashion", brand: "Levis", price: 4299.00, rating: 4.4 },
  { name: "Men Tailored Fit Chinos", category: "Fashion", brand: "Marks & Spencer", price: 2999.00, rating: 4.3 },
  { name: "Women Off-Shoulder Jumpsuit", category: "Fashion", brand: "Mango", price: 3990.00, rating: 4.1 },
  { name: "Men Waterproof Winter Parka", category: "Fashion", brand: "Superdry", price: 9999.00, rating: 4.6 },
  { name: "Women Pleated Midi Skirt", category: "Fashion", brand: "Zara", price: 2590.00, rating: 4.2 },
  { name: "Men Dry-Fit Sports Joggers", category: "Fashion", brand: "Nike", price: 3295.00, rating: 4.4 },
  { name: "Women Chunky Knit Sweater", category: "Fashion", brand: "H&M", price: 1999.00, rating: 4.3 },
  { name: "Men Checked Casual Flannel Shirt", category: "Fashion", brand: "Uniqlo", price: 1990.00, rating: 4.5 },

  // === ACCESSORIES ===
  { name: "Classic Wayfarer Sunglasses", category: "Accessories", brand: "Ray-Ban", price: 8490.00, rating: 4.6 },
  { name: "Men Leather Bi-Fold Wallet", category: "Accessories", brand: "Tommy Hilfiger", price: 2499.00, rating: 4.3 },
  { name: "Women Saffiano Leather Tote Bag", category: "Accessories", brand: "Michael Kors", price: 18500.00, rating: 4.7 },
  { name: "Vintage Analog Watch", category: "Accessories", brand: "Casio", price: 1695.00, rating: 4.5 },
  { name: "Unisex Classic Canvas Backpack", category: "Accessories", brand: "Fjallraven", price: 5499.00, rating: 4.6 },
  { name: "Stainless Steel Smartwatch", category: "Accessories", brand: "Fossil", price: 14995.00, rating: 4.2 },
  { name: "Gold-Plated Minimalist Hoop Earrings", category: "Accessories", brand: "Giva", price: 1299.00, rating: 4.4 },
  { name: "Reversible Leather Belt", category: "Accessories", brand: "Levis", price: 1199.00, rating: 4.1 },
  { name: "Wool Knit Winter Beanie", category: "Accessories", brand: "Columbia", price: 999.00, rating: 4.3 },
  { name: "Silk Floral Scarf", category: "Accessories", brand: "Satya Paul", price: 3950.00, rating: 4.5 },
  { name: "Classic Aviator Sunglasses", category: "Accessories", brand: "Ray-Ban", price: 9490.00, rating: 4.7 },
  { name: "Leather Messenger Laptop Bag", category: "Accessories", brand: "Wildhorn", price: 3499.00, rating: 4.2 },
  { name: "Adjustable Snapback Cap", category: "Accessories", brand: "New Era", price: 1999.00, rating: 4.4 },
  { name: "Waterproof Duffel Bag", category: "Accessories", brand: "Decathlon", price: 1499.00, rating: 4.3 },
  { name: "Chunky Link Bracelet", category: "Accessories", brand: "Fossil", price: 2495.00, rating: 4.2 },
  { name: "Premium Leather Card Holder", category: "Accessories", brand: "Montblanc", price: 12500.00, rating: 4.8 },
  { name: "Unisex Anti-Theft Backpack", category: "Accessories", brand: "Nomatic", price: 16500.00, rating: 4.7 },
  { name: "Polarized Clubmaster Sunglasses", category: "Accessories", brand: "Ray-Ban", price: 10490.00, rating: 4.6 },
  { name: "Minimalist Silver Pendant Necklace", category: "Accessories", brand: "Giva", price: 1799.00, rating: 4.5 },
  { name: "Wool Blend Check Scarf", category: "Accessories", brand: "Tommy Hilfiger", price: 2999.00, rating: 4.4 }
];

const firstNames = [
  "Aarav", "Ananya", "Vihaan", "Diya", "Aditya", "Meera", "Ishaan", "Riya", "Arjun", "Ira",
  "Kabir", "Zara", "Sai", "Kiara", "Reyansh", "Anika", "Krishna", "Prisha", "Aaryan", "Sanya",
  "Dev", "Kavya", "Rahul", "Tanvi", "Siddharth", "Aisha", "Dhruv", "Neha", "Rohan", "Pooja",
  "Amit", "Sneha", "Karan", "Shruti", "Varun", "Aditi", "Manish", "Divya", "Vikram", "Shreya",
  "James", "Emily", "Michael", "Sarah", "David", "Jessica", "Daniel", "Emma", "John", "Olivia"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Patel", "Mehta", "Reddy", "Nair", "Rao", "Joshi", "Iyer",
  "Singh", "Kaur", "Sen", "Roy", "Das", "Chatterjee", "Banerjee", "Mukherjee", "Bose", "Dutta",
  "Shah", "Trivedi", "Pandey", "Mishra", "Dubey", "Prasad", "Kumar", "Choudhury", "Bahl", "Kapoor",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad",
  "Jaipur", "Lucknow", "Chandigarh", "Kochi"
];

const genders = ["Female", "Male", "Other"];

async function main() {
  console.log('Clearing database tables...');
  await prisma.campaignAnalytics.deleteMany({});
  await prisma.communication.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('Seeding products...');
  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({
      data: prod
    });
    createdProducts.push(created);
  }
  console.log(`Successfully seeded ${createdProducts.length} products.`);

  console.log('Generating 1000 customers...');
  const customersData = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (let i = 0; i < 1000; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i + 100}@gmail.com`;
    const phone = `+91 ${9000000000 + Math.floor(Math.random() * 1000000000)}`;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    
    // Spread join date over the last 365 days
    const joinDate = new Date(oneYearAgo.getTime() + Math.random() * (new Date().getTime() - oneYearAgo.getTime()));

    customersData.push({
      name,
      email,
      phone,
      city,
      gender,
      joinDate
    });
  }

  // Create in batches to avoid Prisma parameter limits on large inserts
  const createdCustomers = [];
  const batchSize = 100;
  for (let i = 0; i < customersData.length; i += batchSize) {
    const batch = customersData.slice(i, i + batchSize);
    for (const cust of batch) {
      const created = await prisma.customer.create({ data: cust });
      createdCustomers.push(created);
    }
  }
  console.log(`Successfully seeded ${createdCustomers.length} customers.`);

  console.log('Generating 5000 orders...');
  const orders = [];
  
  // We want to make sure some customers are "premium" (i.e. have high value and multiple orders),
  // while some are average, and some are inactive.
  for (let i = 0; i < 5000; i++) {
    // Pick a customer
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    
    // Pick a product
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];

    // Purchase date must be after joinDate and before today
    const joinTime = customer.joinDate.getTime();
    const nowTime = new Date().getTime();
    const purchaseDate = new Date(joinTime + Math.random() * (nowTime - joinTime));

    orders.push({
      customerId: customer.id,
      productId: product.id,
      amount: product.price,
      category: product.category,
      purchaseDate
    });
  }

  // Create in batches to avoid Prisma parameter limits
  let orderCount = 0;
  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize);
    await Promise.all(
      batch.map(order => 
        prisma.order.create({
          data: order
        })
      )
    );
    orderCount += batch.length;
  }
  console.log(`Successfully seeded ${orderCount} orders.`);

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
