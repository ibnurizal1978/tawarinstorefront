require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise'); // MariaDB

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log('harganya');
    res.send('Hello from Home');
});

app.get('/price', (req, res) => {
    console.log('harganya');
    res.send('Hello from harga');
    
});

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

// Function to fetch store data from the database
async function getStoreBySlug(slug) {
    console.log('ayam')
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Database connected! ');

        const query = 'SELECT * FROM stores WHERE slug = ?';
        console.log('Executing query:', query, slug);

        const [rows] = await connection.execute(query, [slug]);

        console.log('Query result:', rows);

        if (rows.length > 0) {
            console.log('Store found:', rows[0]);
            return rows[0]; // Return the store object
        } else {
            console.log('Store not found for slug:', slug);
            return null;
        }
    } catch (error) {
        console.error('Database error:', error);
        return null; // Handle database errors appropriately
    } finally {
        if (connection) {
            await connection.close();
            console.log('Database connection closed.');
        }
    }
}

// Simulated function to fetch products data from the database
async function getProductsByStoreId(storeId) {
    return new Promise((resolve) => {
        // Simulated data for demonstration purposes
        const products = {
            1: [
                { id: 101, name: 'Kaos Distro', price: 50000, imageUrl: 'https://via.placeholder.com/200' },
                { id: 102, name: 'Kemeja Flanel', price: 120000, imageUrl: 'https://via.placeholder.com/200' }
            ],
            2: [
                { id: 201, name: 'Ban Motor', price: 80000, imageUrl: 'https://via.placeholder.com/200' },
                { id: 202, name: 'Oli Mesin', price: 45000, imageUrl: 'https://via.placeholder.com/200' }
            ],
            3: [
                { id: 301, name: 'Product Godeg 1', price: 10000, imageUrl: 'https://via.placeholder.com/200' },
                { id: 302, name: 'Product Godeg 2', price: 20000, imageUrl: 'https://via.placeholder.com/200' }
            ]
        };
        resolve(products[storeId] || []);
    });
}

app.get('/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const store = await getStoreBySlug(slug);

        if (!store) {
            return res.status(404).send('Toko tidak ditemukan');
        }

        const products = await getProductsByStoreId(store.id)

        res.render('store', { store: store, products: products });
    } catch (error) {
        console.error('Application error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api', (req, res) => {
    res.json({ "msg": "Hello world" });
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})