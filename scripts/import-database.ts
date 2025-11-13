// Import database from SQL file to current DATABASE_URL
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Load .env.local file
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

import { executeNonQuery, getConnection, closeConnection } from '../lib/db-setup';

async function importDatabase() {
  try {
    const sqlFile = resolve(process.cwd(), 'database-export', 'database-export.sql');
    
    if (!existsSync(sqlFile)) {
      console.error('❌ Export dosyası bulunamadı!');
      console.error(`   Beklenen konum: ${sqlFile}`);
      console.error('   Önce export işlemini çalıştırın: npm run export-db');
      process.exit(1);
    }
    
    console.log('📦 Veritabanı import işlemi başlatılıyor...\n');
    console.log(`📁 Dosya: ${sqlFile}\n`);
    
    await getConnection();
    
    // Read SQL file
    const sqlContent = readFileSync(sqlFile, 'utf-8');
    
    // Split by GO statements
    const statements = sqlContent
      .split(/\bGO\b/gi)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 ${statements.length} SQL statement bulundu\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }
      
      try {
        await executeNonQuery(statement);
        successCount++;
        
        // Show progress for every 10 statements
        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ ${i + 1}/${statements.length} statement işlendi...`);
        }
      } catch (error: any) {
        errorCount++;
        // Some errors are expected (like "table already exists")
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('already an object') ||
          error.message.includes('duplicate key')
        )) {
          // Ignore these expected errors
          successCount++;
          errorCount--;
        } else {
          console.error(`   ⚠️  Statement ${i + 1} hatası:`, error.message);
          // Don't stop on errors, continue with next statement
        }
      }
    }
    
    console.log(`\n✅ Import tamamlandı!`);
    console.log(`   ✅ Başarılı: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Hatalı: ${errorCount}`);
    }
    console.log(`\n💡 Tabloları kontrol etmek için: npm run check-tables`);
    
  } catch (error: any) {
    console.error('❌ Import hatası:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

importDatabase().catch(console.error);

