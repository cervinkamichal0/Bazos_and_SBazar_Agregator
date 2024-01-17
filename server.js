const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
let listingsBazos = [];
let listingsAukro = [];
let listingsSBazar = [];
const app = express();
const path = require('path');
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
        console.log(result[1]);
        console.log (Math.ceil(result[1]/20))
        console.log(listingsAmount)
        let pages = Math.ceil(result[1] / 20);
        const promises = [];
        let strana = 20;
        if (pages >= 100) {
             pages = 99;
        }
        for (let i = 0; i < pages; i++) {
            let delay = 800;

            promises.push(
                new Promise(resolve => {
                    setTimeout(async () => {


                        strana = strana + 20;

                        console.log('bazos request' + i);
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
                    }, delay);
                })
            );
        }

        await Promise.all(promises);

        console.log(listingsBazos);
        console.log(listingsBazos.length);
        res.json(listingsBazos);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
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


        const pages = Math.ceil(listingsAmount / 36);
        console.log(pages)
        const promises = [];

        for (let i = 2; i < pages; i++) {
            let delay = 500;
            promises.push(
                new Promise(resolve => {
                    setTimeout(async () => {
                        console.log(i)

                        console.log('sbazar request');
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
                    }, delay);
                })
            );
        }

        await Promise.all(promises);


        console.log(listingsSBazar)
        console.log(listingsSBazar.length)
        console.log(listingsAmount);
        res.json(listingsSBazar);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});



/*app.get('/api/sbazar/:id', async (req, res) => {
try{
    const searchTerm = req.params.id;
    axios({
        url: 'https://www.sbazar.cz/hledej/' + searchTerm + '/0-vsechny-kategorie/',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    }).then( response => {

        let html = response.data
        let $ = cheerio.load(html)

        listingsSBazar = [];

        $('.c-item__group').each(function () {
            const url = $(this).find('.c-item__link').attr('href');
            const nadpis = $(this).find('.c-item__name-text').text().trim();
            const cena = $(this).find('.c-price__price').text().trim();
            const lokace = $(this).find('.c-item__locality').text().trim();
            const img = $(this).find('.c-item__image img').attr('src');

            listingsSBazar.push({
                nadpis,
                cena,
                lokace,
                img,
                url

            });
        });

        let listingsAmount = $('.c-bread-crumbs__items-count').text();
        listingsAmount = listingsAmount.replace(/\s/g, '');
        listingsAmount = listingsAmount.replace(/[()]/g, '');



        console.log(listingsSBazar)
        console.log(listingsSBazar.length)
        console.log(listingsAmount);
        res.json(listingsSBazar);
    })
}catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});
*/




/*app.get('/api/aukro/:id', (req, res) => {

    const searchTerm = req.params.id;

    axios({
        url: 'https://aukro.cz/vysledky-vyhledavani?text=' + searchTerm + '&searchAll=true',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    }).then(response => {

        const html = response.data
        const $ = cheerio.load(html)

        listingsAukro = [];

        $('.item-card-wrapper').each(function () {
            const nadpis = $(this).find('.item-card-body-wrapper h2').text().trim();
            const price = $(this).find('.item-card-body-wrapper .tw-text-xxl span').text().trim();
            const countdown = $(this).find('.item-card-body-wrapper .auk-countdown-panel span').text().trim();

            listingsAukro.push({
                nadpis,
                price,
                countdown
            });
        });

        console.log(html)
        res.json(listingsAukro);


    }).catch(err => {
        console.log(err)
    })
})
*/
app.listen(8000, () => {
    console.log('Server is running on port 8000')
})