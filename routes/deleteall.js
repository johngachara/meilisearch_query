var express = require('express');
require('dotenv').config();
var router = express.Router();
const { MeiliSearch } = require('meilisearch');
const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.API_KEY
});
router.delete('/',async (req,res) => {
    try {
        const response = await client.index('Shop2Stock').deleteAllDocuments()
        res.status(200).json(response)
    }
    catch (err) {
        console.error('Error occurred while deleting all documents:', err);
        res.status(400).send({error: err.message});
    }
})
module.exports = router