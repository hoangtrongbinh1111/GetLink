const axios = require("axios");
const express = require("express");
const puppeteer = require('puppeteer');
var crypto = require("crypto");
var fs = require('fs'),
    request = require('request');

const app = express();
var page
main()
app.get("/test", async (req, res) => {
    const linkImage = req.query.linkImage;
    const title = `image_${crypto.randomBytes(20).toString('hex')}.png`
    try {
        await page.goto(linkImage,{waitUntil: 'load', timeout: 0})
        await page.waitForSelector('.btn-downjpg')
        let linkImg = await page.$eval('.btn-downjpg', anchor => anchor.getAttribute('href')); 
        linkImg = encodeURI(`https://vi.pngtree.com${linkImg}`)
        await page.goto(linkImg,{waitUntil: 'load', timeout: 0})
        await page.waitForSelector('.down-again');
        let linkImg2 = await page.$eval('.down-again', anchor => anchor.getAttribute('href'));
        while(linkImg2 === "javascript:;") {
            page.waitFor(1000);
            linkImg2 = await page.$eval('.down-again', anchor => anchor.getAttribute('href'));
        }
        download(encodeURI(linkImg2), `./image/${title}`, function () {
            res.status(200).send(`${window.location.origin}/image/${title}`);
        })
    } catch (err) {
        res.status(500).send({ error: err.message });
    } finally {
        // driver.quit();
    }
});
async function main() {
    const browser = await puppeteer.launch({ headless: false,args: ['--start-maximized'] });
    page = await browser.newPage();
    await page.setViewport({width: 0, height: 0});
    await page.setDefaultNavigationTimeout(0); 
    await page.goto('https://vi.pngtree.com/'); // wait until page load
    // click and wait for navigation
    await Promise.all([
        page.click('.base-public-login-button')
    ]);
    // await page.setViewport({width: 1200, height: 720});
    await page.type('#base-public-login-email-text', 'djflea@gmail.com');
    await page.type('#base-public-login-password-text', 'master1086');
    // click and wait for navigation
    await Promise.all([
        page.click('#base-sub-Login-Btn')
    ]);
    return page
}

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});