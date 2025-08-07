const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const { getAllProducts, semanticSearch, visualSearch, getProductById } = require('../controllers/productController');

// const { getAllProducts, getProductById } = require('../controllers/productController');

router.get('/products', getAllProducts)
router.get('/products/:id', getProductById);

router.get('/search/semantic', semanticSearch);
router.post('/search/visual', upload.single('productImage'), visualSearch);


module.exports = router;