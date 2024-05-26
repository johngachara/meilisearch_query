var express = require('express');
var router = express.Router();
require('dotenv').config();
const { MeiliSearch } = require('meilisearch');
const { body, validationResult } = require('express-validator');
const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey : process.env.API_KEY
});
(async () => {
    try {
        await client.index('Shop1Stock').updateFilterableAttributes(['id']);
    } catch (error) {
        console.error('Error updating filterable attributes:', error);
    }
})();
router.put('/:id',[
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
        const id = req.body.id
        const data = req.body
        const idRef = parseInt(req.params.id,10)
        if (idRef !== id) {
            return res.status(400).send({error: "Cant complete your request due to errors with ID"});
        }
        const checkID = await client.index('Shop1Stock').search('', {
            filter: `id = ${id}`
        })
        if (checkID.hits.length === 0) {
            res.status(400).json({error: 'Document with the specified ID not found'});
        }
        const updateProduct = await client.index('Shop1Stock').updateDocuments([{
            id:id,
            product_name:data.product_name,
            quantity : data.quantity,
            price : data.price,
            shop : "Shop 1"
        }])
        res.status(200).json(updateProduct);
    }catch (err){
        console.error('Error occurred while trying update:', err);
        res.status(400).send({error: err.message});
    }
    })

module.exports = router
