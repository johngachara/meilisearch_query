var express = require('express');
require('dotenv').config();
var router = express.Router();
const { MeiliSearch } = require('meilisearch');
const { body, validationResult } = require('express-validator');
const host_url = process.env.MEILISEARCH_URL
const client = new MeiliSearch({
  host: host_url,
  apiKey : process.env.API_KEY
});
(async () => {
  try {
    await client.index('Shop1Stock').updateFilterableAttributes(['id','product_name']);
  } catch (error) {
    console.error('Error updating filterable attributes:', error);
  }
})();
/* POST data to MeiliSearch index */
router.post(
    '/',
    [
      body('id').notEmpty().withMessage('ID is required').isInt().withMessage('ID must be a number'),
      body('product_name').notEmpty().withMessage('Product name is required').isString().withMessage('Product name must be a string'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
      body('price').notEmpty().withMessage('Price is required').isDecimal().withMessage('Price must be a decimal number'),
    ],
    async function (req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const data = req.body;
        // Ensure ID uniqueness by querying MeiliSearch
        const checkData = await client.index('Shop1Stock').search('', {
          filter: `id = ${data.id}`,
        });

        if (checkData.hits.length > 0) {
          return res.status(409).json({ error: 'Document with the same ID already exists' });
        }
        const checkProduct = await client.index('Shop1Stock').search('',{
          filter : `product_name = ${data.product_name}`,
        })
        if (checkProduct.hits.length > 0) {
          return res.status(409).json({ error: "Document with the same name already exists" });
        }

        // Proceed to add the document if it's unique
        const response = await client.index('Shop1Stock').addDocuments([
          {
            id: data.id,
            product_name: data.product_name,
            quantity: data.quantity,
            price: data.price
          },
        ]);

        res.status(200).json(response);
      } catch (error) {
        console.error('Error adding documents to MeiliSearch:', error);
        res.status(500).json({ error: 'Failed to add documents to MeiliSearch' });
      }
    }
);

module.exports = router;
