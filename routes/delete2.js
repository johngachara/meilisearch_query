var express = require('express');
require('dotenv').config();
var router = express.Router();
const { MeiliSearch } = require('meilisearch');
const { param, body, validationResult } = require('express-validator');

const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.API_KEY
});

// Initial setup: Update filterable attributes for the index (should be done once, not on each request)
(async () => {
    try {
        await client.index('Shop2Stock').updateFilterableAttributes(['id']);
    } catch (error) {
        console.error('Error updating filterable attributes:', error);
    }
})();

// Delete document route
router.delete('/:id', [
    param('id').notEmpty().withMessage('ID is required').isInt().withMessage('ID must be a number'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);

    try {
        // Check if document with the given ID exists
        const searchResult = await client.index('Shop2Stock').search('', {
            filter: `id = ${id}`
        });

        if (searchResult.hits.length === 0) {
            return res.status(404).json({ error: 'Document with the specified ID not found' });
        }

        // Delete the document
        const deleteResult = await client.index('Shop2Stock').deleteDocument(id);
        return res.status(200).json(deleteResult);

    } catch (err) {
        console.error('Error deleting document:', err);
        return res.status(500).json({ errors: err.message });
    }
});


module.exports = router;
