// Check Tables Script
// This script lists all tables in the database
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env.local file FIRST
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ .env.local dosyası bulunamadı!');
  process.exit(1);
}

dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable bulunamadı!');
  process.exit(1);
}

import { executeQuery, getConnection, closeConnection } from '../lib/db';

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    await getConnection();
    
    // List all tables
    const tables = await executeQuery<{ table_name: string }>(`
      SELECT name as table_name
      FROM sys.tables
      ORDER BY name
    `);
    
    if (tables.length === 0) {
      console.log('❌ Hiç tablo bulunamadı!');
      console.log('   Lütfen `npm run setup-db` komutunu çalıştırın.');
    } else {
      console.log(`✅ ${tables.length} tablo bulundu:\n`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }
    
    // List all columns for each table
    if (tables.length > 0) {
      console.log('\n📋 Tablo detayları:\n');
      for (const table of tables) {
        const columns = await executeQuery<{ column_name: string; data_type: string; is_nullable: string }>(`
          SELECT 
            COLUMN_NAME as column_name,
            DATA_TYPE as data_type,
            IS_NULLABLE as is_nullable
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${table.table_name}'
          ORDER BY ORDINAL_POSITION
        `);
        
        console.log(`   📊 ${table.table_name}:`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)';
          console.log(`      - ${col.column_name}: ${col.data_type} ${nullable}`);
        });
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await closeConnection();
  }
}

checkTables().catch(console.error);

