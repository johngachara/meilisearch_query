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
router.put('/',[])
