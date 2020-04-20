var CronJob = require('cron').CronJob;
var amqp = require('amqplib/callback_api');
var axios = require('axios');
var hageland = require('./Crawlers/HAGELAND_NO/index.js')
var blomsterland = require('./Crawlers/BLOMSTERLANDET_SE/index.js')

var obs = require('./Crawlers/OBS/index.js')


//load categories
new CronJob(process.env.CRON ? process.env.CRON : '1 1 1 * * *', async function () {

    console.log('run CRON ')
    try {
        // make sure that any items are correctly URL encoded in the connection string

        const result = {
            source: 'HAGELAND.NO',
            sitemap: 'https://hageland.no/product_cat-sitemap.xml',
            is_active: process.env.HAGELAND ? process.env.HAGELAND : true

        }

        if (result.is_active == true) {
            console.log('HAGELAND')
            return await hageland.load_categories(result)
        }

    } catch (err) {
        console.log(err);
        // ... error checks
    }



}, null, true, null, null, process.env.RUN_ON_START ? process.env.RUN_ON_START : true);



//load categories
new CronJob(process.env.CRON ? process.env.CRON : '1 1 1 * * *', async function () {

    console.log('run CRON ')
    try {
        // make sure that any items are correctly URL encoded in the connection string

        const result = {
            source: 'BLOMSTERLANDET.SE',
            sitemap: 'https://www.blomsterlandet.se/sitemap.xml',
            is_active: process.env.BLOMSTERLANDET ? process.env.BLOMSTERLANDET : true
        }

        if (result.is_active == true) {
            console.log('start bloom')
            return await blomsterland.load_categories(result)
        }
    } catch (err) {
        console.log(err);
        // ... error checks
    }
}, null, true, null, null, process.env.RUN_ON_START ? process.env.RUN_ON_START : true);



//load categories
new CronJob(process.env.CRON ? process.env.CRON : '1 1 1 * * *', async function () {

    console.log('run CRON ')
    try {
        // make sure that any items are correctly URL encoded in the connection string

        const result = {
            source: 'OBS',

            is_active: process.env.OBS ? process.env.OBS : true
        }

        if (result.is_active == true) {
            console.log('start OBS')
            return await obs.load_categories(result)
        }
    } catch (err) {
        console.log(err);
        // ... error checks
    }
}, null, true, null, null, process.env.RUN_ON_START ? process.env.RUN_ON_START : true);