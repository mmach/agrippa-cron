
var Crawler = require("crawler");
var parseString = require('xml2js').parseString;
const amqp = require('amqplib/callback_api');



let whiteListCategories = [
'https://hageland.no/merkevare/',
'https://hageland.no/dyrebutikk/',
'https://hageland.no/plen/',
'https://hageland.no/planting-og-stell-i-hagen/',
'https://hageland.no/hagemobler/',
'https://hageland.no/dyrk-selv/',
'https://hageland.no/snittblomster/',
'https://hageland.no/krukker-og-potter/',
'https://hageland.no/inneplanter/',
'https://hageland.no/jord-gjodsel-og-bark/',
'https://hageland.no/frukt-og-baer/',
'https://hageland.no/sesongplanter-og-blomster/',
'https://hageland.no/hageplanter/'



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
            } else {
                parseString(res.body
                    , function (err, result) {
                        if (err) {
                            console.log(err);
                            done();
                        }
                        result.urlset.url.filter(item => {
                            if (whiteListCategories.includes(item.loc[0]) && item.loc[0].split('/').length - 1 == 4) {
                                //console.log(item.loc[0])


                                c_sitemap_categories_elements.queue({
                                    uri: item.loc[0],
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

                            }
                        })
                    });
                done();
            }
        }
    }
    );

    var c_sitemap_categories_elements = new Crawler({
        maxConnections: process.env.MAX_CONNECTIONS ? process.env.MAX_CONNECTIONS : 2,
        retries: 10,
        retryTimeout: 60000,
        // This will be called for each crawled page

        callback: function (error, res, done) {
            console.log(c_sitemap_categories.queueSize)
            console.log(c_sitemap_categories_elements.queueSize)

            if (error) {
                console.log(ERROR);
                console.log(error);
                setTimeout(() => {
                    done();
                }, 60000)
            } else {
                var $ = res.$;
                let productsList = $('.product-category.product')
                let products = [];
                Object.keys(productsList).filter(item => {
                    return isNaN(item) == false
                }).map(item => {
                    let a = productsList[item].children;


                    products.push({
                        source: 'HAGELAND.NO',
                        title: a[1].children[3].prev.children[0].children[0].data.replace('\n', ''),
                        href: a[1].attribs.href,
                        group_img: a[1].children[0].attribs["data-src"],
                        parent: null
                    }
                    )
                    //   console.log(a.attribs.href);

                })


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
                        channel.assertQueue('products-queue', {
                            durable: true
                        });

                        products.forEach(item => {
                            ch.sendToQueue('products-queue', new Buffer(JSON.stringify(item)), { persistent: true });
                        })

                    });
                })








                setTimeout(() => {
                    done();

                }, 5000)

            }
        }
    }
    );


    c_sitemap_categories.queue({
        uri: "https://hageland.no/product_cat-sitemap.xml",
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