import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  {
    name: 'Hoodie Navy Classic',
    category: 'Hoodies',
    description: 'Premium cotton hoodie in classic navy color',
    price: 79,
    color: 'Navy',
    material: 'Premium Cotton',
    sku: 'HN-001',
    sizes: [
      { size: 'XS', stock: 10 },
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 18 },
      { size: 'XL', stock: 12 },
      { size: '2XL', stock: 8 },
    ],
  },
  {
    name: 'Quarter Zip Crème',
    category: 'Hoodies',
    description: 'Elegant quarter zip in cream color',
    price: 89,
    color: 'Crème',
    material: 'Premium Cotton',
    sku: 'QZ-001',
    sizes: [
      { size: 'XS', stock: 8 },
      { size: 'S', stock: 12 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 14 },
      { size: 'XL', stock: 10 },
    ],
  },
  {
    name: 'Tee Monte Carlo',
    category: 'T-Shirts',
    description: 'Classic t-shirt inspired by Monte Carlo',
    price: 49,
    color: 'Black',
    material: 'Premium Cotton',
    sku: 'TS-001',
    sizes: [
      { size: 'XS', stock: 20 },
      { size: 'S', stock: 25 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 15 },
      { size: '2XL', stock: 10 },
      { size: '3XL', stock: 5 },
    ],
  },
  {
    name: 'Cap Riviera Beige',
    category: 'Accessories',
    description: 'Classic cap in beige with Riviera logo',
    price: 39,
    color: 'Beige',
    material: 'Cotton',
    sku: 'CAP-001',
    sizes: [
      { size: 'One Size', stock: 30 },
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`${result.length} products inserted successfully`);

    await mongoose.connection.close();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
