
var Crawler = require("crawler");
var parseString = require('xml2js').parseString;
const amqp = require('amqplib/callback_api');



let whiteListCategories = [


]
const CONN_URL = process.env.AMQP ? process.env.AMQP : 'amqp://oqxnmzzs:hUxy1BVED5mg9xWl8lvoxw3VAmKBOn7O@squid.rmq.cloudamqp.com/oqxnmzzs';


let load_categories = (pool, sql) => {

    let urls = [
        "https://www.europris.no/hus-hage",
        "https://www.europris.no/hus-hage/dyrke-selv",
        "https://www.europris.no/hus-hage/grill",
        "https://www.europris.no/hus-hage/hagemobler-utemobler",
        "https://www.europris.no/hus-hage/utebelysning",
        "https://www.europris.no/hus-hage/vanning",
        "https://www.europris.no/hus-hage/varme-klima",
        "https://www.europris.no/hus-hage/solskjerming-vindskjerming"


    ]
    amqp.connect(CONN_URL, function (err, conn) {
        if (err) {
            console.log("CONNECTION ERROR");
            console.log(err);
            setTimeout(() => {
                done();
                try {
                    conn.close();
                } catch (err) {

                }
            }, 60000)
            return;
        }
        conn.createChannel(async function (err2, channel) {
            if (err2) {
                console.log("CHANEL ERROR");

                console.log(err);
                setTimeout(() => {
                    done();
                    try {
                        conn.close();
                    } catch (err) {

                    }
                }, 60000)
                return

            } ch = channel;
            channel.assertQueue('products-queue', {
                durable: true
            });

            urls.forEach(item => {
                ch.sendToQueue('products-queue', new Buffer(JSON.stringify({
                    source: 'EUROPRIS',
                    href: item
                })), { persistent: true });
            })
            setTimeout(() => {
                try {
                    channel.close();
                    conn.close();
                } catch (err) {

                }
            }, 5000)

        });
    })


    // Queue some HTML code directly without grabbing (mostly for tests)
}

module.exports = {
    load_categories
}