
var Crawler = require("crawler");
var parseString = require('xml2js').parseString;
const amqp = require('amqplib/callback_api');



let whiteListCategories = [


]
const CONN_URL = process.env.AMQP ? process.env.AMQP : 'amqp://oqxnmzzs:hUxy1BVED5mg9xWl8lvoxw3VAmKBOn7O@squid.rmq.cloudamqp.com/oqxnmzzs';


let load_categories = (pool, sql) => {


    var c_sitemap_categories = new Crawler({
        maxConnections: 1,
        rateLimit: 2000,

        // This will be called for each crawled page
        preRequest: function (options, done) {
            done();

        },
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
                done();

            } else {
                parseString(res.body
                    , function (err, result) {
                        if (err) {
                            console.log(err);
                            done();
                        }
                        let products = result.urlset.url.filter(item => {
                            if (item.loc[0].startsWith('https://coop.no/sortiment/obs-sortiment/hjem-og-interior/hage-og-uterom/') || item.loc[0].startsWith('https://coop.no/sortiment/obs-bygg/hageuterom')) {
                                //console.log(item.loc[0])

                                return item.loc[0]



                            }
                        }).map(item => { return item.loc[0] })

                        console.log(products);



                        amqp.connect(CONN_URL, function (err, conn) {
                            if (err) {
                                console.log("CONNECTION ERROR");
                                console.log(err);
                                setTimeout(() => {
                                    done();
                                    conn.close();

                                }, 60000)
                                return;
                            }
                            conn.createChannel(async function (err2, channel) {
                                if (err2) {
                                    console.log("CHANEL ERROR");

                                    console.log(err);
                                    setTimeout(() => {
                                        done();
                                    }, 60000)
                                    return

                                } ch = channel;
                                channel.assertQueue('product-item-queue', {
                                    durable: true
                                });

                                products.forEach(item => {
                                    ch.sendToQueue('product-item-queue', new Buffer(JSON.stringify({
                                        source: 'OBS',
                                        href: item
                                    })), { persistent: true });
                                })
                                setTimeout(() => {
                                    channel.close();
                                    conn.close();
                                    done();

                                }, 10000)

                            });
                        })









                    });
            }
        }
    }
    );


    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=1",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=2",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=3",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=4",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })

    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=5",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })

    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=6",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=7",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=8",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=9",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=10",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    c_sitemap_categories.queue({
        uri: "https://coop.no/sitemaps?sitemap=11",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    // Queue some HTML code directly without grabbing (mostly for tests)
}

module.exports = {
    load_categories
}