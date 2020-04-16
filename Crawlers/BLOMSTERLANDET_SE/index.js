
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
                            if (item.loc[0].split('/')[3] == 'produkter' && !item.loc[0].match(/\d/)) {
                                //console.log(item.loc[0])

                                console.log(item.loc[0])
                                return  item.loc[0]



                            }
                        }).map(item => { return item.loc[0] })
                        products = products.filter(item => {
                            return !products.filter(search => {
                                return search.startsWith(item) && search != item
                            }).length > 0
                        })

                        products = products.map(item => {

                            return {
                                source: 'BLOMSTERLANDET.SE',
                                title: item.split('/')[item.split('/').length - 2],
                                href: item + "?page=30",
                                group_img: '',
                                parent: null
                            }

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

                                let prom = products.map(item => {
                                    ch.sendToQueue('products-queue', new Buffer(JSON.stringify(item)), { persistent: true });
                                })
                                await Promise.all(prom);
                                setTimeout(() => {
                                    ch.close();
                                    conn.close();
                                    done();

                                    //  ch.close();
                                }, 1000)

                            });
                        })

                    });
            }
        }
    }
    );


    c_sitemap_categories.queue({
        uri: "https://www.blomsterlandet.se/sitemap.xml",
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