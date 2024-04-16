import fs from 'fs/promises';


/**
 * This function is used to initialize the data in memory into the elastic search database.
 * It will start the database indexes from the data files in the data folder.
 * These data files are to be kept unchanged.
 * @returns {Promise<void>}
 */
async function init_dataMem() {

    try {
        const userstoindex = await fs.readFile('data/users.json', 'utf-8');
        const objectify = {users: JSON.parse(userstoindex)}
        await indexDocument('users', '1', objectify)

    } catch (error) {
        console.log(error);
    }

    try {
        const groupstoindex = await fs.readFile('data/user-groups.json', 'utf-8');
        await indexDocument('groups', '2', JSON.parse(groupstoindex))
    } catch (error) {
        console.log(error);
    }

}

/**
 * This function is used to write to the groups index in the elastic search database.
 * @param groups
 * @returns {Promise<void>}
 */
async function writeToGroups(groups) {

    try {

        await indexDocument('groups', '2', groups);
        console.log("Wrote to groups: ",groups)
    } catch (err) {
        console.log(err);
    }

}

/**
 * This function is used to write to the users index in the elastic search database.
 * @param users
 * @returns {Promise<void>}
 */

async function writeToUsers(users) {
    try {
        const objectify = {
            users: users
        }

        await indexDocument('users', '1', objectify);
    } catch (err) {
        console.log(err);
    }
}

/**
 * This function is used to read the groups index in the elastic search database.
 * @returns {Promise<string>}
 */
async function readGroups() {
    const groups = await retrieveDocument('groups', '2');

    return JSON.stringify(groups);
}

/**
 * This function is used to read the users index in the elastic search database.
 * @returns {Promise<string>}
 */
async function readUsers() {
    const users = await retrieveDocument('users', '1');
    return JSON.stringify(users.users);
}

// Defines the elasticsearch base URL which is specified on the elasticsearch.yml file
const elasticsearchBaseUrl = "http://localhost:9200"; // Replace with your Elasticsearch URL

/**
 * This function is used to index a document into an index on the elastic search database.
 * @param index
 * @param id
 * @param document
 * @returns {Promise<any>}
 */
async function indexDocument(index, id, document) {
    const url = `${elasticsearchBaseUrl}/${index}/_doc/${id}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(document)
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to index document. Status: ${response.status}. Details: ${errorDetails}`);
    }

    return await response.json();
}

/**
 * This function is used to retrieve a document from an index on the elastic search database.
 * @param index
 * @param id
 * @returns {Promise<*>}
 */
async function retrieveDocument(index, id) {
    const url = `${elasticsearchBaseUrl}/${index}/_doc/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch document. Status: ${response.status}`);
    }
    let result = await response.json()

    return result._source;
}

/**
 * Auxiliary function to check if a user exists in the elastic search database.
 * @param uuid
 * @returns {Promise<*>}
 */
async function checkUserExists(uuid) {
    const data = await readUsers();
    const users = JSON.parse(data);
    return users.some(user => user.uuid === uuid);
}

async function getUserByName(username){
    const data = await readUsers();
    const users = JSON.parse(data);
    return users.find(user => user.name === username);
}

async function getUserByUUID(id){
    const data = await readUsers();
    const users = JSON.parse(data);
    return users.find(user => user.uuid === id);
}

export {
    writeToUsers,
    writeToGroups,
    readUsers,
    checkUserExists,
    readGroups,
    getUserByName,
    getUserByUUID
}

/*Uncomment this line and run the server file in order to initialize the data structures in the DB,
    REMEMBER TO COMMENT IT AGAIN AFTER THE FIRST RUN*/

// await init_dataMem()