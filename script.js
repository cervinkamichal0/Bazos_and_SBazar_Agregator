function bazosRespondCheck(listingsList) {
    const bazosCount = listingsList.reduce(function (n, item) {
        return n + (item.server === 'bazos');
    }, 0);
    console.log(bazosCount)
    if (bazosCount === 0)
    {

        const errorText = document.createElement("p");
        errorText.textContent = "Server bazoš přestal odpovídat na requesty. Zkuste to prosím znovu později více specifikovat vyhledávaný term  ín.";
        errorText.style.color = "red";
        errorText.style.fontWeight = "bold";
        dynamicList.appendChild(errorText)
        return false;
    }
    return true;
}

function sortListings(listingsList, sortCriteria) {
    switch (sortCriteria) {
        case 'cheapest':
            for (let i = listingsList.length - 1; i >= 0; i--) {
                const item = listingsList[i];
                if (isNaN(item.cena)) {
                    listingsList.splice(i, 1);
                }
            }
            listingsList.sort((a, b) => a.cena - b.cena);
            return listingsList;
        case 'mostExpensive':
            for (let i = listingsList.length - 1; i >= 0; i--) {
                const item = listingsList[i];
                if (isNaN(item.cena)) {
                    listingsList.splice(i, 1);
                }
            }
            listingsList.sort((a, b) => b.cena - a.cena);
            return listingsList;
        case 'default':
            return listingsList;
    }
}

function appendListings(listingsList) {
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

    let listingsList = [];

    console.log(searchTerm);

    const dynamicList = document.getElementById('dynamicList');
    dynamicList.innerHTML = '';

    const promises = [];


    const fetchBazos = fetch('http://localhost:8000/api/bazos/' + searchTerm)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                item.server = 'bazos';
                listingsList.push(item);
            });

        }).catch(error => console.error('Error fetching data:', error));

    const fetchSbazar = fetch('http://localhost:8000/api/sbazar/' + searchTerm)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                item.server = 'sbazar';
                listingsList.push(item);
            })

        }).catch(error => console.error('Error fetching data:', error));

    promises.push(fetchBazos, fetchSbazar);


    Promise.all(promises)
        .then(() => {

            console.log(listingsList);
            //Serazeni inzerátů podle kriterií
            listingsList = sortListings(listingsList, sortCriteria);

            //Kontrola, jestli odpověděl Bazos na vsechny requesty
            bazosRespondCheck(listingsList);

            //Vlozeni inzeratu do DOMu
            appendListings(listingsList);

        })
        .catch(error => console.error('Error:', error));


}
