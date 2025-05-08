import { db } from "./db";
import {
  users,
  stores,
  medications,
  storeInventory,
  insertUserSchema,
  insertStoreSchema,
  insertMedicationSchema,
  insertStoreInventorySchema,
} from "@shared/schema";
import { InsertStore } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Function to hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Sample medications with real images
const medicationsList = [
  {
    name: "Paracetamol",
    description: "A pain reliever and fever reducer",
    dosage: "500mg",
    manufacturer: "GSK",
    category: "Pain Relief",
    price: 5.99,
    imageUrl: "https://i.ibb.co/CVd2GY8/paracetamol.jpg",
    sideEffects: "Nausea, stomach pain, loss of appetite",
    usageInstructions: "Take 1-2 tablets every 4-6 hours as needed",
  },
  {
    name: "Amoxicillin",
    description: "Antibiotic used to treat bacterial infections",
    dosage: "250mg",
    manufacturer: "Pfizer",
    category: "Antibiotics",
    price: 12.99,
    imageUrl: "https://i.ibb.co/5FC7N1x/amoxicillin.jpg",
    sideEffects: "Diarrhea, stomach upset, vomiting",
    usageInstructions: "Take 1 capsule every 8 hours with food",
  },
  {
    name: "Cetirizine",
    description: "Antihistamine that reduces symptoms of allergies",
    dosage: "10mg",
    manufacturer: "Johnson & Johnson",
    category: "Allergy",
    price: 8.49,
    imageUrl: "https://i.ibb.co/2qPbZ0C/cetirizine.jpg",
    sideEffects: "Drowsiness, dry mouth, headache",
    usageInstructions: "Take 1 tablet daily with or without food",
  },
  {
    name: "Omeprazole",
    description: "Reduces stomach acid production",
    dosage: "20mg",
    manufacturer: "AstraZeneca",
    category: "Digestive Health",
    price: 14.99,
    imageUrl: "https://i.ibb.co/3hpkRNj/omeprazole.jpg",
    sideEffects: "Headache, abdominal pain, diarrhea",
    usageInstructions: "Take 1 capsule daily before breakfast",
  },
  {
    name: "Metformin",
    description: "Oral diabetes medicine that helps control blood sugar",
    dosage: "500mg",
    manufacturer: "Merck",
    category: "Diabetes",
    price: 9.99,
    imageUrl: "https://i.ibb.co/z8LF3Q7/metformin.jpg",
    sideEffects: "Nausea, vomiting, stomach upset, diarrhea",
    usageInstructions: "Take 1-2 tablets with meals",
  },
  {
    name: "Atorvastatin",
    description: "Lowers cholesterol and triglycerides in the blood",
    dosage: "10mg",
    manufacturer: "Pfizer",
    category: "Cardiovascular",
    price: 18.99,
    imageUrl: "https://i.ibb.co/2kP1YhP/atorvastatin.jpg",
    sideEffects: "Mild muscle pain, weakness, stomach upset",
    usageInstructions: "Take 1 tablet daily in the evening",
  },
  {
    name: "Ibuprofen",
    description: "NSAID used to reduce fever and treat pain or inflammation",
    dosage: "400mg",
    manufacturer: "Advil",
    category: "Pain Relief",
    price: 7.49,
    imageUrl: "https://i.ibb.co/XyDQXdz/ibuprofen.jpg",
    sideEffects: "Stomach pain, heartburn, dizziness",
    usageInstructions: "Take 1-2 tablets every 4-6 hours with food",
  },
  {
    name: "Loratadine",
    description: "Antihistamine that treats allergy symptoms",
    dosage: "10mg",
    manufacturer: "Claritin",
    category: "Allergy",
    price: 9.99,
    imageUrl: "https://i.ibb.co/zNdNJWt/loratadine.jpg",
    sideEffects: "Headache, dry mouth, fatigue",
    usageInstructions: "Take 1 tablet daily with water",
  },
];

// Sample pharmacies in Lahore with real images
const lahorePharmacies = [
  {
    name: "MediCare Pharmacy",
    address: "123 Main Road",
    city: "Lahore",
    zipCode: "54000",
    phone: "042-12345678",
    openingHours: "Monday-Saturday: 9am-9pm, Sunday: 10am-6pm",
    description: "A full-service pharmacy offering a wide range of medications and health products.",
    imageUrl: "https://i.ibb.co/HTT4Ljh/pharmacy1.jpg",
    rating: 4.5,
    reviewCount: 120,
  },
  {
    name: "Health First Pharmacy",
    address: "45 Gulberg III",
    city: "Lahore",
    zipCode: "54660",
    phone: "042-87654321",
    openingHours: "Open 24/7",
    description: "Your 24/7 health partner offering quality medications and healthcare advice.",
    imageUrl: "https://i.ibb.co/Br58mSP/pharmacy2.jpg",
    rating: 4.7,
    reviewCount: 95,
  },
];

// Sample pharmacies in Faisalabad with real images
const faisalabadPharmacies = [
  {
    name: "City Pharmacy",
    address: "78 D-Ground",
    city: "Faisalabad",
    zipCode: "38000",
    phone: "041-12345678",
    openingHours: "Monday-Saturday: 8am-10pm, Sunday: 9am-8pm",
    description: "Serving the community with quality medications and excellent service.",
    imageUrl: "https://i.ibb.co/PCcTsk8/pharmacy3.jpg",
    rating: 4.3,
    reviewCount: 78,
  },
  {
    name: "Wellness Pharmacy",
    address: "23 Susan Road",
    city: "Faisalabad",
    zipCode: "38040",
    phone: "041-87654321",
    openingHours: "Monday-Saturday: 9am-9pm, Sunday: 10am-6pm",
    description: "Your neighborhood pharmacy for all your health needs.",
    imageUrl: "https://i.ibb.co/DDkqJ7w/pharmacy4.jpg",
    rating: 4.6,
    reviewCount: 62,
  },
];

// Function to seed data
export async function seedData() {
  console.log("Starting data seeding...");

  try {
    // Create store owner accounts
    const storeOwners = [];

    // Lahore store owners
    for (let i = 0; i < lahorePharmacies.length; i++) {
      const storeOwner = await db.insert(users).values({
        username: `lahore_store_${i + 1}`,
        password: await hashPassword("password123"),
        firstName: `Store`,
        lastName: `Owner ${i + 1}`,
        email: `lahore_store_${i + 1}@example.com`,
        phone: lahorePharmacies[i].phone,
        address: lahorePharmacies[i].address,
        city: "Lahore",
        isStore: true,
      }).returning();
      
      storeOwners.push(storeOwner[0]);
    }

    // Faisalabad store owners
    for (let i = 0; i < faisalabadPharmacies.length; i++) {
      const storeOwner = await db.insert(users).values({
        username: `faisalabad_store_${i + 1}`,
        password: await hashPassword("password123"),
        firstName: `Store`,
        lastName: `Owner ${i + faisalabadPharmacies.length + 1}`,
        email: `faisalabad_store_${i + 1}@example.com`,
        phone: faisalabadPharmacies[i].phone,
        address: faisalabadPharmacies[i].address,
        city: "Faisalabad",
        isStore: true,
      }).returning();
      
      storeOwners.push(storeOwner[0]);
    }

    console.log(`Created ${storeOwners.length} store owner accounts.`);

    // Create stores
    const createdStores = [];

    // Create Lahore pharmacies
    for (let i = 0; i < lahorePharmacies.length; i++) {
      const pharmacy = lahorePharmacies[i];
      const store = await db.insert(stores).values({
        name: pharmacy.name,
        address: pharmacy.address,
        city: pharmacy.city,
        zipCode: pharmacy.zipCode,
        phone: pharmacy.phone,
        email: `info@${pharmacy.name.toLowerCase().replace(/\s+/g, '')}.com`, // Generate email from name
        openingHours: pharmacy.openingHours,
        description: pharmacy.description,
        imageUrl: pharmacy.imageUrl,
        rating: pharmacy.rating,
        reviewCount: pharmacy.reviewCount,
        userId: storeOwners[i].id,
      }).returning();
      
      createdStores.push(store[0]);
    }

    // Create Faisalabad pharmacies
    for (let i = 0; i < faisalabadPharmacies.length; i++) {
      const pharmacy = faisalabadPharmacies[i];
      const store = await db.insert(stores).values({
        name: pharmacy.name,
        address: pharmacy.address,
        city: pharmacy.city,
        zipCode: pharmacy.zipCode,
        phone: pharmacy.phone,
        email: `info@${pharmacy.name.toLowerCase().replace(/\s+/g, '')}.com`, // Generate email from name
        openingHours: pharmacy.openingHours,
        description: pharmacy.description,
        imageUrl: pharmacy.imageUrl,
        rating: pharmacy.rating,
        reviewCount: pharmacy.reviewCount,
        userId: storeOwners[i + lahorePharmacies.length].id,
      }).returning();
      
      createdStores.push(store[0]);
    }

    console.log(`Created ${createdStores.length} pharmacies.`);

    // Create medications
    const createdMedications = [];
    for (const med of medicationsList) {
      const medication = await db.insert(medications).values(med).returning();
      createdMedications.push(medication[0]);
    }

    console.log(`Created ${createdMedications.length} medications.`);

    // Create store inventory
    let totalInventoryItems = 0;
    for (const store of createdStores) {
      // Each store will have a random selection of medications
      const numMedicationsForStore = Math.floor(Math.random() * (createdMedications.length - 3)) + 3; // At least 3 medications per store
      const shuffledMeds = [...createdMedications].sort(() => 0.5 - Math.random());
      const selectedMeds = shuffledMeds.slice(0, numMedicationsForStore);
      
      for (const med of selectedMeds) {
        const quantity = Math.floor(Math.random() * 100) + 10; // Random quantity between 10-110
        const priceAdjustment = (Math.random() * 0.4) - 0.2; // Random price adjustment between -20% and +20%
        const price = med.price * (1 + priceAdjustment);
        
        await db.insert(storeInventory).values({
          storeId: store.id,
          medicationId: med.id,
          inStock: true,
          quantity,
          price: parseFloat(price.toFixed(2)), // Round to 2 decimal places
        });
        
        totalInventoryItems++;
      }
    }

    console.log(`Created ${totalInventoryItems} inventory items.`);
    console.log("Data seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}