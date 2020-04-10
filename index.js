var CronJob = require('cron').CronJob;
var amqp = require('amqplib/callback_api');
var axios = require('axios');
var olx = require('./Crawlers/HAGELAND_NO/index.js')



//load categories
new CronJob(process.env.CRON ? process.env.CRON : '1 1 1 * * *', async function () {

    console.log('run CRON ')
    try {
        // make sure that any items are correctly URL encoded in the connection string

        const result = [
            {
                source: 'HAGELAND.NO',
                sitemap: 'https://hageland.no/product_cat-sitemap.xml'
            }
        ];
        let promisesList = result.map(async item => {

            if (item.source == 'HAGELAND.NO') {
                return await olx.load_categories(item)
            }
        });
        await Promise.all(promisesList)
    } catch (err) {
        console.log(err);
        // ... error checks
    }



}, null, true, null, null, process.env.RUN_ON_START ? process.env.RUN_ON_START : true);
