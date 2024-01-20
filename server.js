const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
let listingsBazos = [];
let listingsSBazar = [];
const app = express();
const cors = require('cors');

app.use(cors());
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/api/bazos/:id', async (req, res) => {
    try {
        listingsBazos = [];
        const searchTerm = req.params.id;
        const response = await axios('https://www.bazos.cz/search.php?hledat=' + searchTerm + '&rubriky=www&hlokalita=&humkreis=25&cenaod=&cenado=&Submit=Hledat&order=&kitx=ano');
        let html = response.data;
        let $ = cheerio.load(html);


        $('.inzeraty.inzeratyflex').each(function () {
            const nadpis = $(this).find('.nadpis').text()
            const popis = $(this).find('.popis').text()
            const cena = $(this).find('.inzeratycena').text().replace('Kč','').replace(/\s/g, '')
            const lokace = $(this).find('.inzeratylok').text()
            const datumVlozeni = $(this).find('.velikost10').text().replace(/[^0123456789. ]+/g, '')
            const img = $(this).find('.obrazek').attr('src')
            const url = $(this).find('a').attr('href')
            listingsBazos.push({
                nadpis,
                popis,
                cena,
                lokace,
                datumVlozeni,
                img,
                url
            });
        });

        let listingsAmount = $('.inzeratynadpis').text();
        listingsAmount = listingsAmount.replace(/\s/g, '');
        const re = new RegExp("inzerátůz(\\d+)");
        const result = re.exec(listingsAmount);
        //console.log(result[1]);
        console.log ('Počet stran pro hledaný výraz na Bazoši: ' + Math.ceil(result[1]/20))
        let pages = Math.ceil(result[1] / 20);
        const promises = [];
        let strana = 20;
        let pageDelay = 0;

        if (pages > 50) {
            pages = 50
        }

        for (let i = 0; i < pages; i++) {

            await sleep (250);
            if(i === pageDelay+50) {
                pageDelay += 50
                await sleep (5000);
            }

            promises.push(
                new Promise(resolve => {
                    setTimeout(async () => {
                        strana+=20
                        console.log('bazos request: ' + i + ' | ' + strana);
                        const response = await axios('https://www.bazos.cz/search.php?hledat=' + searchTerm + '&hlokalita=&humkreis=25&cenaod=&cenado=&order=&crz=' + strana);
                        html = response.data;
                        $ = cheerio.load(html);


                        $('.inzeraty.inzeratyflex').each(function () {
                            const nadpis = $(this).find('.nadpis').text()
                            const popis = $(this).find('.popis').text()
                            const cena = $(this).find('.inzeratycena').text().replace('Kč','').replace(/\s/g,'')
                            const lokace = $(this).find('.inzeratylok').text()
                            const datumVlozeni = $(this).find('.velikost10').text().replace(/[^0123456789. ]+/g, '')
                            const img = $(this).find('.obrazek').attr('src')
                            const url = $(this).find('a').attr('href')
                            listingsBazos.push({
                                nadpis,
                                popis,
                                cena,
                                lokace,
                                datumVlozeni,
                                img,
                                url
                            });
                        });

                        resolve();
                    }, 250);
                })
            );
        }

        await Promise.all(promises);

        //console.log(listingsBazos);
        console.log('pocet scrapnutých inzerátů z Bazose: ' + listingsBazos.length);
        res.json(listingsBazos);
    } catch (err) {
        console.log(err);
    }
});



app.get('/api/sbazar/:id', async (req, res) => {
    try {
        listingsSBazar = [];
        const searchTerm = req.params.id;
        const response = await axios( 'https://www.sbazar.cz/hledej/' + searchTerm + '/0-vsechny-kategorie/');
        let html = response.data;
        let $ = cheerio.load(html);


        $('.c-item__group').each(function () {
            const nadpis = $(this).find('.c-item__name-text').text().trim();
            const popis = 'Více informací se dozvíte po otevření inzerátu';
            const cena = $(this).find('.c-price__price').text().trim().replace(/\s/g,'')
            const lokace = $(this).find('.c-item__locality').text().trim();
            const datumVlozeni = '';
            const img = $(this).find('.c-item__image img').attr('src');
            const url = $(this).find('.c-item__link').attr('href');

            listingsSBazar.push({
                nadpis,
                popis,
                cena,
                lokace,
                datumVlozeni,
                img,
                url

            });
        });

        let listingsAmount = $('.c-bread-crumbs__items-count').text();
        listingsAmount = listingsAmount.replace(/\s/g, '');
        listingsAmount = listingsAmount.replace(/[()]/g, '');


        let pages = Math.ceil(listingsAmount / 36);

        const promises = [];
        if (pages > 200){
            pages = 200
        }


        for (let i = 2; i <= pages; i++) {

            await sleep(100)
            promises.push(
                new Promise(resolve => {
                    setTimeout(async () => {

                        console.log('sbazar request: ' + i);
                        const response = await axios('https://www.sbazar.cz/hledej/' + searchTerm + '/0-vsechny-kategorie/cela-cr/cena-neomezena/nejnovejsi/' + i);
                        html = response.data;
                        $ = cheerio.load(html);


                        $('.c-item__group').each(function () {
                            const nadpis = $(this).find('.c-item__name-text').text().trim();
                            const popis = 'Více informací se dozvíte po otevření inzerátu';
                            const cena = $(this).find('.c-price__price').text().trim().replace(/\s/g,'');
                            const lokace = $(this).find('.c-item__locality').text().trim();
                            const datumVlozeni = '';
                            const img = $(this).find('.c-item__image img').attr('src');
                            const url = $(this).find('.c-item__link').attr('href');


                            listingsSBazar.push({
                                nadpis,
                                popis,
                                cena,
                                lokace,
                                datumVlozeni,
                                img,
                                url

                            });
                        });

                        resolve();
                    }, 250);
                })
            );
        }

        await Promise.all(promises);


        //console.log(listingsSBazar)
        console.log('Počet inzerátů scrapnutých z Sbazaru: '+listingsSBazar.length)
        res.json(listingsSBazar);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(80, '0.0.0.0',() => {
    console.log('HTTP Server is running on port 80')
})


