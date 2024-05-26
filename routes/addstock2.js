var express = require('express');
var router = express.Router();
require('dotenv').config();
const { MeiliSearch } = require('meilisearch');
const { body, validationResult } = require('express-validator');

const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey :process.env.API_KEY
});

// Initial setup: Update filterable attributes for the index (should be done once, not on each request)
(async () => {
    try {
        await client.index('Shop2Stock').updateFilterableAttributes(['id','product_name']);
    } catch (error) {
        console.error('Error updating filterable attributes:', error);
    }
})();

router.use((req,res,next) => {
    const {product_name} = req.body;
    for(let key in product_name){
        product_name[key] = product_name[key].trim();
    }
    next()
})

/* POST data to MeiliSearch index */
router.post(
    '/',
    [
        body('id').notEmpty().withMessage('ID is required').isInt().withMessage('ID must be a number'),
        body('product_name').notEmpty().withMessage('Product name is required').isString().withMessage('Product name must be a string'),
        body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
        body('price').notEmpty().withMessage('Price is required').isDecimal().withMessage('Price must be a decimal number'),
    ],
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const data = req.body;

            // Ensure ID uniqueness by querying MeiliSearch
            const checkData = await client.index('Shop2Stock').search('', {
                filter: `id = ${data.id}`,
            });

            if (checkData.hits.length > 0) {
                return res.status(409).json({ error: 'Document with the same ID already exists' });
            }

            const checkProduct = await client.index('Shop2Stock').search('',{
                filter : `product_name = "${data.product_name}"`,
            })
            if (checkProduct.hits.length > 0) {
                return res.status(409).json({ error: 'Document with the same name already exists' });
            }

            // Add the document to the index
            const response = await client.index('Shop2Stock').addDocuments([
                {
                    id: data.id,
                    product_name: data.product_name,
                    quantity: data.quantity,
                    price: data.price,
                    shop : "Shop2"
                },
            ]);

            res.status(200).json(response);
        } catch (error) {
            console.error('Error adding document to Shop2Stock:', error);
            res.status(500).json({
                message: 'An error occurred while adding the document. Please try again later.',
                error: error.message,
            });
        }
    }
);

module.exports = router;
