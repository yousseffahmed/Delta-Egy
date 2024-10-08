require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const MongoStore = require('connect-mongo');

const mongoURI = process.env.MONGO_URI;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


const app = express();
const server = http.createServer(app);

const bodyParser = require('body-parser');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

const Product = require('./models/products');
const Order = require('./models/orders');
const Complaint = require('./models/complaints');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});


// app.use(limiter);

app.use(cors());

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://deltaegy.3dlayers.app"],
      },
    })
  );

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'None' },
    store: MongoStore.create({ mongoUrl: mongoURI })
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
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.get('/', (req, res) => {
    if (!req.session.cart || !Array.isArray(req.session.cart)) {
        req.session.cart = [];
    }
    res.sendFile(path.join(__dirname, 'view/index.html'));
});

app.get('/light', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/light.html'));
});

app.get('/print', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/print.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/contact.html'));
});

app.get('/intouch', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/intouch.html'));
});

app.get('/deltaAdminService', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'view/deltaAdminService.html'));
    }
    else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/shop', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('shop', { products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ _id: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Error fetching orders');
    }
});

const ordersFilePath = path.join(__dirname, 'view/orders.html');

app.get('/orders', (req, res) => {
    res.sendFile(ordersFilePath);
});

app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find({});
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).send('Error fetching complaints');
    }
});

const complaintsFilePath = path.join(__dirname, 'view/complaints.html');

app.get('/complaints', (req, res) => {
    res.sendFile(complaintsFilePath);
});

app.get('/cart', (req, res) => {
    const items = req.session.cart
    res.render('cart', { items: items });
});

app.get('/checkout', (req, res) => {
    const items = req.session.cart
    res.render('checkout', { items: items });
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/success.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/about.html'));
});

app.get('/cart/count', (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0;
    res.json({ count: cartCount });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '13DeltaAdmin@4653') {
        req.session.loggedIn = true;
        res.redirect('/deltaAdminService');
    } else {
        res.redirect('/login');
    }
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

app.post('/cart/update/:id', (req, res) => {
    const itemId = req.params.id;
    const newQuantity = req.body.quantity;

    let cart = req.session.cart || [];
    
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = parseInt(newQuantity);
    }

    let newSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    req.session.cart = cart;

    res.json({ success: true, newSubtotal });
});


app.post('/submit_order', async (req, res) => {
    const { fname, lname, email, number, shippingMethod, address, city, building, floor, aprt, post, workingAddress } = req.body;

    const orderNumber = generateOrderNumber();

    const updatedCart = req.session.cart.map(item => {
        if (item.name === "Flat Frame" || item.name === "Curved Frame" || item.name === "Keychain") {
            item.image = {
                filename: item.image.filename || 'default.jpg',
                mimetype: item.image.mimetype || 'image/jpeg'
            };
        } else {
            item.image = {
                filename: item.image,
                mimetype: 'image/jpeg'
            };
        }
        return item;
    });

    const order = new Order({
        orderNumber,
        fname,
        lname,
        email,
        number,
        shippingMethod,
        address,
        city,
        building,
        floor,
        aprt,
        post,
        workingAddress,
        items: updatedCart,
        total: req.session.total,
    });

    try {
        await order.save();

        let messageCustomer = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #D35F18;">New Order Details:</h2>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Name:</strong> ${fname} ${lname}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${number}</p>
                <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
                ${shippingMethod === 'delivery' ? `
                <fieldset style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
                    <legend style="color: #D35F18;">Shipping Address</legend>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>City:</strong> ${city}</p>
                    <p><strong>Building:</strong> ${building}</p>
                    <p><strong>Floor:</strong> ${floor}</p>
                    <p><strong>Aprt:</strong> ${aprt}</p>
                    <p><strong>Postal Code:</strong> ${post}</p>
                    <p><strong>This is a working address:</strong> ${workingAddress ? 'Yes' : 'No'}</p>
                </fieldset>
                ` : ''}
                <h3 style="color: #D35F18; margin-top: 20px;">Order Items:</h3>
            `;

        updatedCart.forEach(item => {
            messageCustomer += `
                <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
                    <p><strong>Item Name:</strong> ${item.name}</p>
                    <p><strong>Item Color:</strong> ${item.color}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Price:</strong> ${item.price}</p>
                    <img src="cid:${item.id}" alt="${item.name}" style="max-width: 100px; margin-top: 10px;" />
                </div>
            `;
        });

        messageCustomer += `
            <p style="margin-top: 20px;"><strong>Total:</strong> ${req.session.total}</p>
            </div>
        `;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 10,
            rateLimit: 5
        });

        let attachments = updatedCart.map(item => {
            return {
                filename: item.image.filename,
                path: item.name === "Flat Frame" || item.name === "Curved Frame" || item.name === "Keychain" ? `./uploads/${item.image.filename}` : item.image.filename,
                cid: item.id
            };
        });

        let mailOptionsCustomer = {
            from: emailUser,
            to: email,
            subject: "Order Confirmed",
            html: messageCustomer,
            attachments: attachments
        };

        req.session.cart = [];
        req.session.total = 0;

        transporter.sendMail(mailOptionsCustomer, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                res.status(500).send('Error sending email');
            } else {
                res.redirect(`/success?orderNumber=${orderNumber}`);
            }
        });
    } catch (error) {
        console.log('Error saving order:', error);
        res.status(500).send('Error saving order');
    }
});


app.post('/contact', async (req, res) => {
    const { name, email, number, message } = req.body;

    const complaint = new Complaint({
        name,
        email,
        number,
        message,
    });

    await complaint.save();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    let mailOptions = {
        from: emailUser,
        to: 'solidforms3d@gmail.com',
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nPhone Number: ${number}\n\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.redirect('/intouch');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

app.put('/api/orders/:orderNumber/status', async (req, res) => {
    const { orderNumber } = req.params;

    try {
        const order = await Order.findOneAndUpdate(
            { orderNumber },
            { status: 'done' },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/orders/:orderNumber/cancel', async (req, res) => {
    const { orderNumber } = req.params;

    try {
        const order = await Order.findOneAndUpdate(
            { orderNumber },
            { status: 'cancelled' },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/order/cart-details/:orderNumber', async (req, res) => {
    const orderNumber = req.params.orderNumber;

    try {
        const order = await Order.findOne({ orderNumber: orderNumber });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.render('cart-details', { order: order });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/complaints/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedComplaint = await Complaint.findByIdAndUpdate(id, { status: 'Answered' }, { new: true });
        res.json(updatedComplaint);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).send('Error updating status');
    }
});

app.post('/cart/add', async (req, res) => {
    const { productId, quantity, color} = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cartItem = {
            productId: product._id,
            name: product.name,
            color: color,
            price: product.price,
            quantity: parseInt(quantity),
            image: product.images[0],
            id: generateId()
        };

        cartItem.price = cartItem.price * cartItem.quantity;

        req.session.cart.push(cartItem);

        res.status(200).json({ message: 'Product added to cart', cart: req.session.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
});

function generateOrderNumber() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    return `ORDER-${timestamp}-${randomNum}`;
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

const axios = require('axios');

app.post('/paymob-payment', async (req, res) => {
    const { amount, email, fname, lname, phone, address, city, country } = req.body;

    try {
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: process.env.PAYMOB_API_KEY
        });

        const authToken = authResponse.data.token;

        const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: authToken,
            delivery_needed: "false",
            amount_cents: amount * 100,
            currency: "EGP",
            merchant_order_id: generateOrderNumber(),
            items: []
        });

        const orderId = orderResponse.data.id;

        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: authToken,
            amount_cents: amount * 100,
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                email: email,
                first_name: fname,
                last_name: lname,
                phone_number: phone,
                address: address,
                city: city,
                country: country
            },
            currency: "EGP",
            integration_id: process.env.PAYMOB_INTEGRATION_ID
        });

        const paymentKey = paymentKeyResponse.data.token;

        res.json({ paymentKey });

    } catch (error) {
        console.error('Error processing Paymob payment:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
});


server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
  });
