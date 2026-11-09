import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Admin } from '../models/Admin.js';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      parsed[key] = val;
    }
  }

  return parsed;
};

const run = async () => {
  console.log('--- Lahore Property Hub: Admin Provisioning Script ---');

  const args = parseArgs();
  const email = (args.email || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = args.password || process.env.ADMIN_PASSWORD || '';
  const name = args.name || process.env.ADMIN_NAME || 'Super Administrator';

  if (!email || !password) {
    console.error(
      '❌ Error: Both --email and --password arguments are required.\n\nUsage:\n  npm run create-admin -- --email admin@lahorepropertyhub.com --password YourSecurePassword123! --name "Admin Name"\n'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters in length.');
    process.exit(1);
  }

  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Error: Could not connect to MongoDB Atlas.');
    process.exit(1);
  }

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`⚠️ Admin with email "${email}" already exists. Updating password...`);
      existing.password = password;
      existing.name = name;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Admin account "${email}" updated successfully!`);
    } else {
      const admin = new Admin({
        email,
        password,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      });
      await admin.save();
      console.log(`✅ Administrator "${email}" created successfully with role SUPER_ADMIN!`);
    }
  } catch (err) {
    console.error('❌ Failed to provision admin:', err);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
