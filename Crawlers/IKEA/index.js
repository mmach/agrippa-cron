
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
                var $ = res.$;
                //  console.log(res.body)
                let productsList = $('.range-catalog-list__link');
                //     console.log(productsList);
                let group = {}
                let parent = $('.range-breadcrumb__list-item--active');
                let category = []
                Object.keys(productsList).filter(item => {
                    return isNaN(item) == false
                }).map(item => {
                    let a = productsList[item].children;
                    category.push({
                        source: 'IKEA',
                        title: a[0].next.children[0].data,
                        href: `https://sik.search.blue.cdtapps.com/ie/en/product-list-page/more-products?category=${a[0].parent.attribs.href.split('-')[a[0].parent.attribs.href.split('-').length - 1].replace('/', '')}&sort=RELEVANCE&start=0&end=2000&c=plp&v=20200331`,
                        group_img: null,
                        category_id: a[0].parent.attribs.href.split('-')[a[0].parent.attribs.href.split('-').length - 1].replace('/', ''),
                        parent: parent[0].children[0].next.children[0].next.children[0].data.trim()
                    }
                    )

                });

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



                        category.forEach(item => {
                            ch.sendToQueue('products-queue', new Buffer(JSON.stringify(item)), { persistent: true });
                        })
                        setTimeout(() => {
                            channel.close();
                            conn.close();

                            //  ch.close();
                        }, 1000)


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
        uri: "https://www.ikea.com/ie/en/cat/decoration-de001/",
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
        uri: "https://www.ikea.com/ie/en/cat/outdoor-products-od001/",
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