
function bazosRespondCheck(bazosListings, dynamicList) {
    console.log('pocet inzerátu z Bazoše: ' + bazosListings.length)
    if (bazosListings === 0)
    {
        const errorText = document.createElement("p");
        errorText.textContent = "Server bazoš přestal odpovídat na requesty. Zkuste to prosím znovu později více specifikovat vyhledávaný termín.";
        errorText.style.color = "red";
        errorText.style.fontWeight = "bold";
        errorText.style.fontSize = "1.2em";
        dynamicList.appendChild(errorText)
        return false;
    }
    return true;
}

function sortListings(bazosListings,sbazarListings, sortCriteria) {
    let listingsList = [];
    switch (sortCriteria) {

        case 'cheapest':
            listingsList = bazosListings.concat(sbazarListings)
            for (let i = listingsList.length - 1; i >= 0; i--) {
                const item = listingsList[i];
                if (isNaN(item.cena)) {
                    listingsList.splice(i, 1);
                }
            }
            listingsList.sort((a, b) => a.cena - b.cena);
            return listingsList;

        case 'mostExpensive':
            listingsList = bazosListings.concat(sbazarListings)
            for (let i = listingsList.length - 1; i >= 0; i--) {
                const item = listingsList[i];
                if (isNaN(item.cena)) {
                    listingsList.splice(i, 1);
                }
            }
            listingsList.sort((a, b) => b.cena - a.cena);
            return listingsList;

        case 'default':
            let maxLength = 0
            if (sbazarListings.length > bazosListings.length) {
                maxLength = sbazarListings.length;
            } else {
                maxLength = bazosListings.length;
            }

            let i = 0
            let bazosIndex = 0
            let sbazarIdnex = 0
            while(i < maxLength*2){
                if (i%2 === 0 && sbazarIdnex < sbazarListings.length){
                    listingsList.push(sbazarListings[sbazarIdnex]);
                    sbazarIdnex++;
                    i++;
                }else{
                    if(bazosIndex < bazosListings.length){
                        listingsList.push(bazosListings[bazosIndex]);
                        bazosIndex++
                        i++;
                    }else{
                        i++;
                    }
                }
            }
            return listingsList;
    }
}

function appendListings(listingsList,dynamicList) {
    dynamicList.innerHTML = '';
    listingsList.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('bazos-list-item');
        if (!isNaN(item.cena)) {
            item.cena = item.cena.toLocaleString() + ' CZK';
        }

        li.innerHTML = `
               <h2 class="bazos-title"><a href=${item.url}  target="_blank">${item.nadpis}</a></h2>
               <p class="bazos-description">${item.popis}</p>
               <div class="price bazos-price">${item.cena}</div>
               <div class="location bazos-location">${item.lokace}</div>
               <div class="uploadDate bazos-upload-date">${item.datumVlozeni}</div>
               <img class="bazos-image" src="${item.img}" alt="Image">
           `;

        dynamicList.appendChild(li);

    })
}


function submit() {
    const searchTerm = document.getElementById('searchInput').value;
    const sortCriteria = document.getElementById("sortCriteria").value;

    // Vytvoření URL s parametry pro novou stránku
    const queryParams = new URLSearchParams();
    queryParams.set('sortCriteria', sortCriteria);
    queryParams.set('searchTerm', searchTerm);
    const queryString = queryParams.toString();

    // Přesměrování na novou stránku s výsledky
    window.location.href = 'results.html?' + queryString;

}

function onloadEvent(){

    const queryParams = new URLSearchParams(window.location.search);
    const sortCriteria = queryParams.get('sortCriteria');
    const searchTerm = queryParams.get('searchTerm');
    document.getElementById('sortCriteria').value = sortCriteria || 'default';
    document.getElementById('searchInput').value = searchTerm || '';

    let bazosListings = [];
    let sbazarListings = [];
    let listingsList = [];

    console.log('Hledaný výraz: ' + searchTerm);

    const dynamicList = document.getElementById('dynamicList');
    dynamicList.innerHTML = '';

    const promises = [];


    const fetchBazos = fetch('http://ec2-13-49-145-48.eu-north-1.compute.amazonaws.com:8000/api/bazos/' + searchTerm)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                item.server = 'bazos';
                bazosListings.push(item);
            });

        }).catch(error => console.error('Error fetching data:', error));

    const fetchSbazar = fetch('http://ec2-13-49-145-48.eu-north-1.compute.amazonaws.com:8000/api/sbazar/' + searchTerm)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                item.server = 'sbazar';
                sbazarListings.push(item);
            })

        }).catch(error => console.error('Error fetching data:', error));

    promises.push(fetchBazos, fetchSbazar);


    Promise.all(promises)
        .then(() => {
            console.log(sbazarListings);
            console.log(bazosListings);

            //Serazeni inzerátů podle kriterií
            listingsList = sortListings(bazosListings,sbazarListings, sortCriteria);
            console.log(listingsList);
            console.log('Počet inzerátů celkově: '+ listingsList.length);

            //Kontrola, jestli odpověděl Bazos na vsechny requesty
            bazosRespondCheck(bazosListings,dynamicList);

            //Vlozeni inzeratu do DOMu
            appendListings(listingsList,dynamicList);

        })
        .catch(error => console.error('Error:', error));


}
