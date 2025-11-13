// Export from local DB and import to new DB
// This script will:
// 1. Connect to local DB and export all tables/data
// 2. Connect to new DB and import everything

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';

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

console.log('📋 Bu script iki aşamalı çalışır:');
console.log('   1. Local veritabanından export (DATABASE_URL local olmalı)');
console.log('   2. Yeni veritabanına import (DATABASE_URL yeni olmalı)');
console.log('\n⚠️  ÖNEMLİ: Export için önce .env.local dosyanızı local veritabanına ayarlayın!');
console.log('   Sonra bu scripti çalıştırın, export tamamlandıktan sonra');
console.log('   .env.local dosyanızı yeni veritabanına geri çevirin ve import edin.\n');

// Import after env is loaded
import { executeQuery, executeQueryOne, getConnection, closeConnection, executeNonQuery } from '../lib/db-setup';

async function exportDatabase() {
  try {
    console.log('📦 Local veritabanından export başlatılıyor...\n');
    
    await getConnection();
    
    // Get all tables
    const tables = await executeQuery<{ name: string; schema: string }>(`
      SELECT 
        t.name as name,
        s.name as schema
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      WHERE s.name = 'dbo'
      ORDER BY t.name
    `);
    
    if (tables.length === 0) {
      console.log('❌ Local veritabanında hiç tablo bulunamadı!');
      return;
    }
    
    console.log(`✅ ${tables.length} tablo bulundu:\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });
    
    // Create export directory
    const exportDir = resolve(process.cwd(), 'database-export');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir, { recursive: true });
    }
    
    const allScripts: string[] = [];
    allScripts.push('-- Database Export');
    allScripts.push(`-- Generated: ${new Date().toISOString()}`);
    allScripts.push('-- This script contains all tables, data, and constraints\n');
    
    for (const table of tables) {
      console.log(`\n📋 Exporting ${table.name}...`);
      
      // Get table structure
      const columns = await executeQuery<any>(`
        SELECT 
          c.name as column_name,
          t.name as data_type,
          c.max_length,
          c.precision,
          c.scale,
          c.is_nullable,
          ISNULL(dc.definition, '') as column_default,
          c.is_identity
        FROM sys.columns c
        INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
        LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
        WHERE c.object_id = OBJECT_ID('${table.name}')
        ORDER BY c.column_id
      `);
      
      // Get primary key
      const primaryKey = await executeQuery<{ column_name: string }>(`
        SELECT c.name as column_name
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.object_id = OBJECT_ID('${table.name}')
        AND i.is_primary_key = 1
        ORDER BY ic.key_ordinal
      `);
      
      // Build CREATE TABLE statement
      allScripts.push(`\n-- ============================================`);
      allScripts.push(`-- Table: ${table.name}`);
      allScripts.push(`-- ============================================\n`);
      allScripts.push(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.name}')`);
      allScripts.push(`BEGIN`);
      allScripts.push(`    CREATE TABLE [${table.name}] (`);
      
      const columnDefs: string[] = [];
      for (const col of columns) {
        let def = `        [${col.column_name}] `;
        
        // Data type
        if (col.data_type === 'nvarchar' || col.data_type === 'varchar') {
          const length = col.max_length === -1 ? 'MAX' : (col.max_length / (col.data_type === 'nvarchar' ? 2 : 1));
          def += `${col.data_type.toUpperCase()}(${length})`;
        } else if (col.data_type === 'decimal' || col.data_type === 'numeric') {
          def += `${col.data_type.toUpperCase()}(${col.precision || 18},${col.scale || 2})`;
        } else {
          def += col.data_type.toUpperCase();
        }
        
        // Identity
        if (col.is_identity) {
          def += ' IDENTITY(1,1)';
        }
        
        // Nullable
        if (col.is_nullable === 0) {
          def += ' NOT NULL';
        }
        
        // Default
        if (col.column_default) {
          const defaultValue = col.column_default.replace(/^\(|\)$/g, '');
          def += ` DEFAULT ${defaultValue}`;
        }
        
        columnDefs.push(def);
      }
      
      allScripts.push(columnDefs.join(',\n'));
      allScripts.push(`    );\n`);
      
      // Add primary key
      if (primaryKey.length > 0) {
        const pkColumns = primaryKey.map(pk => `[${pk.column_name}]`).join(', ');
        allScripts.push(`    ALTER TABLE [${table.name}] ADD CONSTRAINT [PK_${table.name}] PRIMARY KEY (${pkColumns});\n`);
      }
      
      allScripts.push(`    PRINT '✅ ${table.name} table created';`);
      allScripts.push(`END`);
      allScripts.push(`ELSE`);
      allScripts.push(`BEGIN`);
      allScripts.push(`    PRINT 'ℹ️  ${table.name} table already exists';`);
      allScripts.push(`END`);
      allScripts.push(`GO\n`);
      
      // Export data
      const data = await executeQuery<any>(`SELECT * FROM [${table.name}]`);
      if (data.length > 0) {
        allScripts.push(`-- Data for ${table.name}`);
        
        const hasIdentity = columns.some(c => c.is_identity);
        
        if (hasIdentity) {
          allScripts.push(`SET IDENTITY_INSERT [${table.name}] ON;`);
          allScripts.push(`GO\n`);
        }
        
        for (const row of data) {
          const columnNames = columns.map(c => `[${c.column_name}]`).join(', ');
          const values: string[] = [];
          
          for (const col of columns) {
            const value = row[col.column_name];
            if (value === null || value === undefined) {
              values.push('NULL');
            } else if (col.data_type === 'nvarchar' || col.data_type === 'varchar' || col.data_type === 'text' || col.data_type === 'ntext') {
              const escaped = String(value).replace(/'/g, "''");
              values.push(`N'${escaped}'`);
            } else if (col.data_type === 'datetime2' || col.data_type === 'datetime' || col.data_type === 'date') {
              const dateValue = value instanceof Date ? value : new Date(value);
              values.push(`'${dateValue.toISOString().replace('T', ' ').substring(0, 23)}'`);
            } else if (col.data_type === 'bit') {
              values.push(value ? '1' : '0');
            } else {
              values.push(String(value));
            }
          }
          
          allScripts.push(`INSERT INTO [${table.name}] (${columnNames}) VALUES (${values.join(', ')});`);
        }
        
        if (hasIdentity) {
          allScripts.push(`SET IDENTITY_INSERT [${table.name}] OFF;`);
        }
        allScripts.push(`GO\n`);
        
        console.log(`   ✅ ${data.length} kayıt export edildi`);
      } else {
        console.log(`   ℹ️  Tablo boş`);
      }
    }
    
    // Write to file
    const outputFile = resolve(exportDir, 'database-export.sql');
    writeFileSync(outputFile, allScripts.join('\n'), 'utf-8');
    
    console.log(`\n✅ Export tamamlandı!`);
    console.log(`📁 Dosya: ${outputFile}`);
    console.log(`\n💡 Şimdi .env.local dosyanızı yeni veritabanına geri çevirin ve import edin.`);
    
  } catch (error: any) {
    console.error('❌ Export hatası:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

exportDatabase().catch(console.error);

