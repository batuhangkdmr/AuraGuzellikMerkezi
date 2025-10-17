// Database Initialize Script
import sql from 'mssql';
import fs from 'fs';
import path from 'path';

const config: sql.config = {
  server: 'localhost\\MSSQLSERVER01',
  database: 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: '',
    }
  }
};

async function initDatabase() {
  try {
    console.log('🔄 SQL Server bağlantısı kuruluyor...');
    const pool = await sql.connect(config);
    console.log('✅ Bağlantı başarılı!');

    // SQL script'i oku
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'create-database.sql'),
      'utf-8'
    );

    // Script'i satırlara böl ve GO komutlarına göre ayır
    const batches = sqlScript.split(/^\s*GO\s*$/gim);

    console.log('🔄 Veritabanı oluşturuluyor...');
    
    for (const batch of batches) {
      const trimmedBatch = batch.trim();
      if (trimmedBatch.length > 0 && !trimmedBatch.startsWith('--')) {
        await pool.request().query(trimmedBatch);
      }
    }

    console.log('✅ Veritabanı ve tablolar başarıyla oluşturuldu!');
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

initDatabase();

