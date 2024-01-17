function submit() {
    let listingsList = [];
    const searchTerm = document.getElementById('searchInput').value;
    console.log(searchTerm);
    const dynamicList = document.getElementById('dynamicList');
    dynamicList.innerHTML = '';
    const promises = [];
    const sortCriteria = document.getElementById("sortCriteria").value;

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
            console.log('Both fetch requests completed.');
            console.log(listingsList);
            switch (sortCriteria) {
                case 'cheapest':
                    listingsList.forEach(item => {
                        if (isNaN(item.cena)) {
                            const index = listingsList.indexOf(item);
                            listingsList.splice(index, 1);
                        }
                    })
                    listingsList.sort((a, b) => a.cena - b.cena);
                    break;
                case 'mostExpensive':
                    listingsList.forEach(item => {
                        if (isNaN(item.cena)) {
                            const index = listingsList.indexOf(item);
                            listingsList.splice(index, 1);
                        }
                    })
                    listingsList.sort((a, b) => b.cena - a.cena);
                    break;

            }
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

        })
        .catch(error => console.error('Error:', error));

}