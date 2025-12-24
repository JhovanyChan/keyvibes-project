require('dotenv').config(); // To load environment variables from .env file
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path');
const nodemailer = require('nodemailer'); // For sending emails

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// --- Nodemailer Transporter Setup ---
// This transporter uses the credentials from your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error with email transporter configuration:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});


// --- Mock Databases ---
const products = [
    { id: 1, name: 'Llavero Panda saludando"', description: 'Llavero de panda haciendo un gesto de saludo alegre.', price: '$15.00 MXN', imageUrl: 'images/panda_saludando_prin.jpg', frontImageUrl: 'images/panda.jpg', backImageUrl: 'images/panda_saludo.jpg', songUrl: 'https://open.spotify.com/track/4HeCFqiB1rBqGqvE10rF1a?si=GRr8eJCpTa6-mToydZ5gtw' },
    { id: 2, name: 'Llavero Panda celular rosa "', description: 'Llavero de panda cargando un celular de color rosa pastel.', price: '$15.00 MXN', imageUrl: 'images/panda_rosa_prin.jpg', frontImageUrl: 'images/panda2.jpg', backImageUrl: 'images/panda_celular_rosa.jpg', songUrl: 'https://open.spotify.com/track/1DpC4L3JjsGRW7y6eTHaMj?si=tC9PGE4dTQmkpi5BnQ7zvQ' },
    { id: 3, name: 'Llavero Panda celular azul', description: 'Llavero de panda cargando un celular de color azul.', price: '$15.00 MXN', imageUrl: 'images/panda_azul_prin.jpg', frontImageUrl: 'images/panda 3.jpg', backImageUrl: 'images/panda_azul_trasero.jpg', songUrl: 'https://open.spotify.com/track/578Eooad7oUyn4stovZiPg?si=39oxwiFpSt-242nET4FwPQ' },
    { id: 4, name: 'Llavero tortuga azul ', description: 'Llavero de una tortuga azul brillante.', price: '$20.00 MXN', imageUrl: 'images/tortuga_azul_prin.jpg', frontImageUrl: 'images/tortuga_azul_frontal.jpg', backImageUrl: 'images/tortuga_azul_atras.jpg', songUrl: 'https://open.spotify.com/track/2KslE17cAJNHTsI2MI0jb2?si=VC-UkCRYQyWoAJ3HWdRWCw' },
    { id: 5, name: 'Llavero de tortuga rosa', description: 'Llavero de tortuga rosa brillante.', price: '$20.00 MXN', imageUrl: 'images/tortuga_rosa_prin.jpg', frontImageUrl: 'images/tortuga_rosa_frontal', backImageUrl: 'images/tortuga_rosa_atras.jpg', songUrl: 'https://open.spotify.com/track/5QDLhrAOJJdNAmCTJ8xMyW?si=BmkrIQanQymBlInZX0Zp4Q' },
    { id: 6, name: 'Llavero pintura de Vangoh', description: 'Esta es la pintura de la noche estrellada de Vangoh.', price: '$30.00 MXN', imageUrl: 'images/vangoh_prin.jpg', frontImageUrl: 'images/pintura_vangoh_frontal.jpg', backImageUrl: 'images/pintura_vangoh_atras.jpg', songUrl: 'https://open.spotify.com/track/53iuhJlwXhSER5J2IYYv1W?si=qQZZL02iQpu9Lio-b3BlPA' },
    { id: 7, name: 'Llavero de perritos', description: 'Llaveros de animales, variedad de razas de perritos.', price: '$6.00 c/u MXN', imageUrl: 'images/perrito_prin.jpg', frontImageUrl: 'images/perro_frontal.jpg', backImageUrl: 'images/perro_atras.jpg', songUrl: 'https://open.spotify.com/track/2ogKhhoMClkFXek7ZgxAhN?si=c9FPTfmARs-mIGBNgApa7g' },
    { id: 8, name: 'Llavero de paleta de pintura', description: 'Llaveros paletas de pintura.', price: '$10.00 MXN', imageUrl: 'images/paleta_blanca_prin.jpg', frontImageUrl: 'images/pintura_paleta_blanco_frontal.jpg', backImageUrl: 'images/pintura_paleta_blanco_.jpg', songUrl: 'https://open.spotify.com/track/4kkeuVl6gF3RMqE4Nn5W3E?si=s8e_tHIqRRekwSRKHVsebw' }
];
const customizableProducts = [
    { id: 101, name: 'Llavero Paleta de pintura azul', price: '$10.00 MXN', imageUrl: 'images/paleta_pintura_azul.jpg' },
    { id: 102, name: 'Llavero paleta de pintura rosado', price: '$10.00 MXN', imageUrl: 'images/paleta_rosado.jpg' }
];

// --- API Endpoints ---

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/customizable-products', (req, res) => res.json(customizableProducts));

app.get('/api/generate-qr', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    try {
        const qrCodeDataUrl = await qrcode.toDataURL(url);
        res.json({ qrCode: qrCodeDataUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

app.post('/api/submit-order', (req, res) => {
    const { productId, productName, songUrl } = req.body;
    if (!productId || !productName || !songUrl) return res.status(400).json({ error: 'Missing order details.' });
    console.log('--- NUEVA SOLICITUD DE PEDIDO RECIBIDA ---');
    console.log(`  Modelo de Llavero: ${productName} (ID: ${productId})`);
    console.log(`  Enlace de la Canción: ${songUrl}`);
    console.log('------------------------------------------');
    res.status(200).json({ message: '¡Solicitud recibida con éxito!' });
});

// --- NEW: Contact Form Endpoint ---
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender address
        to: 'jhovanyazcorra14@gmail.com', // Your receiving email address
        subject: `Nuevo Mensaje de Contacto de ${name}`,
        text: `Has recibido un nuevo mensaje desde el formulario de contacto de tu web.\n\nNombre: ${name}\nEmail: ${email}\nMensaje:\n${message}`,
        replyTo: email
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.' });
        }
        res.status(200).json({ message: '¡Mensaje enviado con éxito!' });
    });
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

// --- Fallback Route ---
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});