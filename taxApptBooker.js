let REFRESH_INTERVAL = 5; // minutes


function nodeFetch(url) {
    return fetch(url, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "Referer": "https://bookedin.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
}

function browserFetch(url) {
    return fetch(url, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://bookedin.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    });
}

function flexibleFetch(url) {
    if (typeof window === 'undefined') {
        // NODE
        return nodeFetch(url);
    }

    // BROWSER
    return browserFetch(url);
}


async function getJuanAppts() {
    const JUAN_RESOURCE_ID = '6262974851448832';
    const todayDate = new Date().toLocaleDateString("fr-CA");
    const response = await flexibleFetch(`https://scheduler.bookedin.com/api/v3/companies/tax-service-express/dayAvailability?from=${todayDate}&to=2024-08-01&services=&resources=${JUAN_RESOURCE_ID}`);
    const result = await response.json();

    if (result.slots.length) {
        const soonestDateMils = result.slots[0].d;
        const soonestDate = new Date(soonestDateMils).toLocaleDateString("fr-CA");
        const dayResponse = await flexibleFetch(`https://scheduler.bookedin.com/api/v3/companies/tax-service-express/availability?d=${soonestDate}&services=&resources=${JUAN_RESOURCE_ID}`);
        const dayResult = await dayResponse.json();
        const juanServices = dayResult.services.filter(service => service.resources.find(resource => resource.resourceId === JUAN_RESOURCE_ID));
        const earliestSlotsPerService = juanServices.map(service => ({ name: service.serviceName, time: new Date(service.resources.find(resource => resource.resourceId === JUAN_RESOURCE_ID).slots[0].d) }));
        
        console.log(`The earliest date Juan is free is on ${soonestDate}. Here are the earliest times for his services:`);
        console.log('')
        console.log('SERVICES:')

        const longestSlotLength = earliestSlotsPerService.reduce((acc, curr) => {
            if (curr.name.length > acc) {
                return curr.name.length;
            }

            return acc;
        }, 0);

        earliestSlotsPerService.forEach(slot => {
            const remainderSpaces = ' '.repeat(longestSlotLength - slot.name.length + 5);
            console.log(`${slot.name}:${remainderSpaces} ${slot.time}`);
        });

        console.log('')
        console.log('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
        console.log('||||||||||||||||||||| WILL CHECK AGAIN IN ' + REFRESH_INTERVAL + ' MINUTES ||||||||||||||||||||||');
        console.log('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
    }
}

getJuanAppts();
setInterval(getJuanAppts, REFRESH_INTERVAL * 60 * 1000);
