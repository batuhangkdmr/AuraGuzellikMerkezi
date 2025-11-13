// Database Export Script
// Exports all tables and data from local database to SQL script files
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

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

import { executeQuery, executeQueryOne, getConnection, closeConnection } from '../lib/db-setup';

interface TableInfo {
  name: string;
  schema: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  column_default: string | null;
  is_identity: boolean;
}

interface ForeignKeyInfo {
  constraint_name: string;
  table_name: string;
  column_name: string;
  referenced_table: string;
  referenced_column: string;
}

async function exportDatabase() {
  try {
    console.log('📦 Veritabanı export işlemi başlatılıyor...\n');
    
    await getConnection();
    
    // Get all tables
    const tables = await executeQuery<TableInfo>(`
      SELECT 
        t.name as name,
        s.name as schema
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      WHERE s.name = 'dbo'
      ORDER BY t.name
    `);
    
    if (tables.length === 0) {
      console.log('❌ Hiç tablo bulunamadı!');
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
    
    // Export schema and data for each table
    const allScripts: string[] = [];
    allScripts.push('-- Database Export');
    allScripts.push(`-- Generated: ${new Date().toISOString()}`);
    allScripts.push('-- This script contains all tables, data, and constraints\n');
    allScripts.push('SET IDENTITY_INSERT OFF;\n');
    
    for (const table of tables) {
      console.log(`\n📋 Exporting ${table.name}...`);
      
      // Get table structure
      const columns = await executeQuery<ColumnInfo & { precision: number; scale: number; max_length: number }>(`
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
      
      // Get foreign keys
      const foreignKeys = await executeQuery<ForeignKeyInfo>(`
        SELECT 
          fk.name as constraint_name,
          OBJECT_NAME(fk.parent_object_id) as table_name,
          COL_NAME(fc.parent_object_id, fc.parent_column_id) as column_name,
          OBJECT_NAME(fk.referenced_object_id) as referenced_table,
          COL_NAME(fc.referenced_object_id, fc.referenced_column_id) as referenced_column
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fc ON fk.object_id = fc.constraint_object_id
        WHERE fk.parent_object_id = OBJECT_ID('${table.name}')
      `);
      
      // Get indexes
      const indexes = await executeQuery<{ index_name: string; columns: string }>(`
        SELECT 
          i.name as index_name,
          STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) as columns
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.object_id = OBJECT_ID('${table.name}')
        AND i.is_primary_key = 0
        AND i.is_unique_constraint = 0
        GROUP BY i.name
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
        const colWithDetails = col as any;
        if (col.data_type === 'nvarchar' || col.data_type === 'varchar') {
          const length = colWithDetails.max_length === -1 ? 'MAX' : (colWithDetails.max_length / 2);
          def += `${col.data_type.toUpperCase()}(${length})`;
        } else if (col.data_type === 'decimal' || col.data_type === 'numeric') {
          def += `${col.data_type.toUpperCase()}(${colWithDetails.precision || 18},${colWithDetails.scale || 2})`;
        } else {
          def += col.data_type.toUpperCase();
        }
        
        // Identity
        if (col.is_identity) {
          def += ' IDENTITY(1,1)';
        }
        
        // Nullable
        if (col.is_nullable === 'NO') {
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
      
      // Add indexes
      for (const index of indexes) {
        allScripts.push(`IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = '${index.index_name}')`);
        allScripts.push(`BEGIN`);
        allScripts.push(`    CREATE INDEX [${index.index_name}] ON [${table.name}] (${index.columns.split(', ').map(c => `[${c}]`).join(', ')});`);
        allScripts.push(`END`);
        allScripts.push(`GO\n`);
      }
      
      // Add foreign keys
      for (const fk of foreignKeys) {
        allScripts.push(`IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = '${fk.constraint_name}')`);
        allScripts.push(`BEGIN`);
        allScripts.push(`    ALTER TABLE [${table.name}] ADD CONSTRAINT [${fk.constraint_name}]`);
        allScripts.push(`        FOREIGN KEY ([${fk.column_name}]) REFERENCES [${fk.referenced_table}] ([${fk.referenced_column}]);`);
        allScripts.push(`END`);
        allScripts.push(`GO\n`);
      }
      
      // Export data
      const data = await executeQuery<any>(`SELECT * FROM [${table.name}]`);
      if (data.length > 0) {
        allScripts.push(`-- Data for ${table.name}`);
        
        const identityColumns = columns.filter(c => c.is_identity);
        const hasIdentity = identityColumns.length > 0;
        
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
            } else if (col.data_type === 'nvarchar' || col.data_type === 'varchar' || col.data_type === 'text') {
              // Escape single quotes
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
    console.log(`\n💡 Sonraki adım: Bu dosyayı yeni veritabanında çalıştırın.`);
    
  } catch (error: any) {
    console.error('❌ Export hatası:', error.message);
    console.error(error);
  } finally {
    await closeConnection();
  }
}

exportDatabase().catch(console.error);

