
import * as dataMem from './seca-data-mem.mjs';


const apiKey = 'yZezrkgZrATxTMVDlicZCocjNE4Nyqq4';


/**
 * This module is used to interact directly with the Ticketmaster API.
 * It serves as a base module for some of the functionalities of the SECA API service module.
 */


//--------------------Helper functions--------------------//

/**
 * This function is used to check if the token is valid. It uses the dataMem module to check if the user exists.
 * @param token
 * @returns True or False
 */
async function isTokenValid(token) {
    return await dataMem.checkUserExists(token);
}

/**
 * This function is used to fetch a JSON response file from the URL.
 * @param url
 * @returns JSON File
 */
async function fetchJSONfromURL(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

//--------------------MAIN FUNCTIONS--------------------//

/**
 * This function is used to search for events by name. It's used by the searchByName function in the service module.
 * @param token
 * @param name
 * @param apikey
 * @param s
 * @param p
 * @returns Event List
 */

async function searchByName(token, name, apikey, s, p) {
    if (!await isTokenValid(token)) {
        return "invalid";
    }

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${name}&apikey=${apikey}&size=${s}&page=${p}`;
    const out = await fetchJSONfromURL(url);
    let events = out._embedded.events && out._embedded.events || [];
    let objOut = {};

    let outList = [];
    events.forEach(it => {
        if (it) {
            objOut = {
                "id": it["id"],
                "name": it["name"],
                "date": it["dates"] && it["dates"]["start"] && it["dates"]["start"]["dateTime"] || "No date available",
                "sales": it["sales"] && it["sales"]["public"]["startDateTime"] || "No date available",
                "images": it["images"] && it["images"][0] && it["images"][0]["url"] || null,
                "segment": it["classifications"] && it["classifications"][0] && it["classifications"][0]["segment"]["name"] || "N/A",
                "genre": it["classifications"] && it["classifications"][0] && it["classifications"][0]["genre"]["name"] || "N/A",
                "subgenre": it["classifications"] && it["classifications"][0] && it["classifications"][0]["subGenre"]["name"] || "N/A"
            };

        }
        outList.push(objOut);
    })

    return outList;


}


/**
 * This function is used to search for events by popularity. It's used by the searchByPopularity function in the service module.
 * @param token
 * @param apikey
 * @param size
 * @param page
 * @returns Event List
 */
async function searchByPopularity(token, apikey, size, page) {
    if (!await isTokenValid(token)) {
        return "invalid";
    }

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?&apikey=${apikey}&size=${size}&page=${page}&sort=relevance,desc`;
    const out = await fetchJSONfromURL(url);

    let events = out._embedded.events;

    let outList = [];
    let objOut = {};

    events.forEach(it => {
        if (it) {
            objOut = {
                "id": it["id"],
                "name": it["name"],
                "date": it["dates"] && it["dates"]["start"] && it["dates"]["start"]["dateTime"] || "No date available",
                "sales": it["sales"] && it["sales"]["public"]["startDateTime"] || "No date available",
                "images": it["images"] && it["images"][0] && it["images"][0]["url"] || null,
                "segment": it["classifications"] && it["classifications"][0] && it["classifications"][0]["segment"]["name"] || "N/A",
                "genre": it["classifications"] && it["classifications"][0] && it["classifications"][0]["genre"]["name"] || "N/A",
                "subgenre": it["classifications"] && it["classifications"][0] && it["classifications"][0]["subGenre"]["name"] || "N/A"
            };
        }
        outList.push(objOut);
    });

    return outList;
}

/**
 * This function is used to get the details of an event. It's used by the getEventDetails function in the service module.
 * @param id
 * @returns Event Details
 */
async function getDetails(id) {
    const url = `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${apiKey}`;

    try {
        let data = await fetchJSONfromURL(url)
        return {
            id: id,
            name: data.name ?? null,
            date: data?.dates.start.dateTime ?? null,
            sales: data.sales.public.startDateTime ?? null,
            images: data?.images ?? null,
            segment: data?.classifications[0].segment.name ?? null,
            genre: data?.classifications[0].genre.name ?? null,
            subgenre: data?.classifications[0].subGenre.name ?? null

        };
    } catch (error) {
        console.error('Error fetching details', error)
    }
    return null;
}


export {
    searchByName,
    searchByPopularity,
    getDetails,
    fetchJSONfromURL
}
