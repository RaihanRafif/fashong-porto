const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const { getAllProducts, semanticSearch, visualSearch, getProductById, aiStylist, aiChatHandler } = require('../controllers/productController');

// const { getAllProducts, getProductById } = require('../controllers/productController');

router.get('/products', getAllProducts)
router.get('/products/:id', getProductById);

router.get('/search/semantic', semanticSearch);
router.post('/search/visual', upload.single('productImage'), visualSearch);
router.get('/products/:id/stylist', aiStylist);

router.post('/chat', aiChatHandler);


module.exports = router;