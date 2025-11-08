// Test de conexión a la base de datos
// Ejecutar con: node backend/test-db-connection.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('=== TEST DE CONEXIÓN A BASE DE DATOS ===\n');
  
  console.log('Configuración:');
  console.log('- Host:', process.env.DB_HOST || 'localhost');
  console.log('- User:', process.env.DB_USER || 'root');
  console.log('- Database:', process.env.DB_NAME || 'carbidDB');
  console.log('- Port:', process.env.DB_PORT || 3306);
  console.log('');

  try {
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'carbidDB',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Conexión exitosa a MySQL\n');

    // Probar consultas
    console.log('=== PROBANDO CONSULTAS ===\n');

    // 1. Verificar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas encontradas:', tables.length);
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    console.log('');

    // 2. Contar usuarios
    const [users] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log('Total de usuarios:', users[0].total);

    // 3. Contar subastas
    const [auctions] = await connection.execute('SELECT COUNT(*) as total FROM auctions');
    console.log('Total de subastas:', auctions[0].total);

    // 4. Contar pujas
    const [bids] = await connection.execute('SELECT COUNT(*) as total FROM bids');
    console.log('Total de pujas:', bids[0].total);
    console.log('');

    // 5. Listar usuarios
    const [userList] = await connection.execute(
      'SELECT id, name, lastname, email, role FROM users'
    );
    console.log('=== USUARIOS ===');
    userList.forEach(u => {
      console.log(`  - ${u.name} ${u.lastname} (${u.email}) - ${u.role}`);
    });
    console.log('');

    // 6. Listar subastas
    const [auctionList] = await connection.execute(`
      SELECT a.id, a.title, a.brand, a.model, a.status, a.end_time,
             u.name as vendedor_name, u.lastname as vendedor_lastname
      FROM auctions a
      JOIN users u ON a.vendedor_id = u.id
    `);
    console.log('=== SUBASTAS ===');
    if (auctionList.length === 0) {
      console.log('  (No hay subastas)');
    } else {
      auctionList.forEach(a => {
        console.log(`  - ${a.title} by ${a.vendedor_name} ${a.vendedor_lastname}`);
        console.log(`    ${a.brand} ${a.model} - Status: ${a.status}`);
        console.log(`    Cierra: ${a.end_time}`);
      });
    }

    await connection.end();
    console.log('\n✓ Test completado exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('\nDetalles del error:', error);
    process.exit(1);
  }
}

testConnection();