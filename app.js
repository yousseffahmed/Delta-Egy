const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);

const bodyParser = require('body-parser');

const hostname = '127.0.0.1';
const port = 3000;

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.get('/', (req, res) => {
    if (!req.session.cart || !Array.isArray(req.session.cart)) {
        req.session.cart = [];
    }
    res.sendFile(path.join(__dirname, 'view/index.html'));
});

app.get('/light.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/light.html'));
});

app.get('/print.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/print.html'));
});

app.get('/cart.html', (req, res) => {
    const items = req.session.cart
    res.render('cart', { items: items });
});

app.get('/checkout.html', (req, res) => {
    const items = req.session.cart
    res.render('checkout', { items: items });
});

app.get('/success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/success.html'));
});


app.post('/add-to-cart-flat', (req, res) => {
    const selectedItem = req.body;
    req.session.cart.push(selectedItem);
    res.sendStatus(200);
});

app.post('/add-to-cart-curved', (req, res) => {
    const selectedItem = req.body;
    req.session.cart.push(selectedItem);
    res.sendStatus(200);
});

app.post('/add-to-cart-key', (req, res) => {
    const selectedItem = req.body;
    req.session.cart.push(selectedItem);
    res.sendStatus(200);
});

app.get('/cart/count', (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0;
    res.json({ count: cartCount });
});

app.post('/upload-flat', upload.single('image'), (req, res) => {
    const uploadedImage = req.file;

    const { name, size, includeStand, quantity, price, id } = req.body;

    const selectedItem = {
        image: uploadedImage,
        name: name,
        size: size,
        includeStand: includeStand,
        quantity: quantity,
        price: price,
        id: id
    };

    req.session.cart.push(selectedItem);

    res.sendStatus(200);
});

app.post('/upload-curved', upload.single('image'), (req, res) => {
    const uploadedImage = req.file;

    const { name, size, includeStand, quantity, price, id } = req.body;

    const selectedItem = {
        image: uploadedImage,
        name: name,
        size: size,
        quantity: quantity,
        price: price,
        id: id
    };

    req.session.cart.push(selectedItem);

    res.sendStatus(200);
});

app.post('/upload-kc', upload.single('image'), (req, res) => {
    const uploadedImage = req.file;

    const { name, size, includeStand, quantity, price, id } = req.body;

    const selectedItem = {
        image: uploadedImage,
        name: name,
        quantity: quantity,
        price: price,
        id: id
    };

    req.session.cart.push(selectedItem);

    res.sendStatus(200);
});

app.post('/checkout', (req, res) => {
    const total = req.body.total;

    req.session.total = total;

    res.json({ message: 'Total updated successfully', total: req.session.total });
});

app.delete('/cart/remove/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const index = req.session.cart.findIndex(item => item.id === itemId);

    if (index !== -1) {
        req.session.cart.splice(index, 1);
        res.sendStatus(200);
    } else {
        res.status(404).json({ message: 'Item not found in cart' });
    }
});

app.post('/submit_order', (req, res) => {
    const { fname, lname, email, number, shippingMethod, address, city, building, floor, aprt, post, workingAddress } = req.body;

    const orderNumber = generateOrderNumber();

    let message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #6d3ca4;">New Order Details:</h2>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Customer Name:</strong> ${fname} ${lname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${number}</p>
            <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
            ${shippingMethod === 'delivery' ? `
            <fieldset style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
                <legend style="color: #6d3ca4;">Shipping Address</legend>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>City:</strong> ${city}</p>
                <p><strong>Building:</strong> ${building}</p>
                <p><strong>Floor:</strong> ${floor}</p>
                <p><strong>Aprt:</strong> ${aprt}</p>
                <p><strong>Postal Code:</strong> ${post}</p>
                <p><strong>This is a working address:</strong> ${workingAddress ? 'Yes' : 'No'}</p>
            </fieldset>
            ` : ''}
            <h3 style="color: #6d3ca4; margin-top: 20px;">Order Items:</h3>
        `;

    req.session.cart.forEach(item => {
        const imageURL = `${req.protocol}://${req.get('host')}/uploads/${item.image.filename}`;

        const imageMimeType = item.image.mimetype;

        message += `
            <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
                <p><strong>Item Name:</strong> ${item.name}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> ${item.price}</p>
                <img src="cid:${item.id}" alt="${item.name}" style="max-width: 100%; margin-top: 10px;" />
            </div>
        `;
    });

    message += `
        <p style="margin-top: 20px;"><strong>Total:</strong> ${req.session.total}</p>
        </div>
    `;

    let transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'youssef.zakii@outlook.com',
            pass: '13EBDAEE47work'
        }
    });

    let mailOptions = {
        from: 'youssef.zakii@outlook.com',
        to: 'yoyo_ah360@hotmail.com',
        subject: 'New Order Received',
        html: message,
        attachments: req.session.cart.map(item => ({
            filename: item.image.filename,
            path: `./uploads/${item.image.filename}`,
            cid: item.id
        }))
    };

    req.session.cart = [];
    req.session.total = 0;

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            res.redirect(`/success.html?orderNumber=${orderNumber}`);
        }
    });
});

function generateOrderNumber() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    return `ORDER-${timestamp}-${randomNum}`;
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
