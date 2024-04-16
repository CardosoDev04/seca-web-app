import * as tmData from './tm-events-data.mjs';
import * as dataMem from './seca-data-mem.mjs';
import {CustomError} from "./Class Extensions/errors.mjs";

const apiKey = 'yZezrkgZrATxTMVDlicZCocjNE4Nyqq4'


/**
 * This module contains all functionality related to the use of the SECA Web Application.
 * It interacts with the SECA Data Memory Module, and the TicketMaster API Module.
 */


//---------------------------FUNCTIONS---------------------------------//


/**
 * Given a username and password, this function will create a new User Object, and add it to the User File.
 * It will automatically assign a random unique UUID to the user.
 * @param username
 * @param password
 * @returns Writes to User File
 */
async function createUser(username, password) {
    let UUID = crypto.randomUUID();
    let user = {
        name: username,
        uuid: UUID,
        password: password
    }

    if (!username || !password) {
        throw new CustomError('Bad request', 400);
    }
    const currentUsers = await dataMem.readUsers();
    const parsed = JSON.parse(currentUsers)
    const existingUser = parsed.find(existingUser => existingUser.name === user.name);

    if (existingUser) {
        throw new CustomError('User already exists', 501);
    }

    let userArray = [];

    try {
        if (currentUsers) {
            userArray = JSON.parse(currentUsers);


        }

        userArray.push(user);
        await dataMem.writeToUsers(userArray);
    } catch (error) {
        throw new CustomError('Internal error', 500);
    }
}

/**
 * Given a username and password, this function will verify if the user exists, and if the password is correct.
 * It will return the user's UUID if the credentials are correct.
 * @param username
 * @param password
 * @returns User UUID
 */
async function loginUser(username, password) {
    if (!username || !password) {

        throw new CustomError('Bad request', 400);
    }
    const currentUsers = await dataMem.readUsers();
    const parsed = JSON.parse(currentUsers);
    const existingUser = parsed.find(existingUser => existingUser.name === username);
    if (!existingUser) {
        throw new CustomError('User does not exist', 505);
    }
    if (existingUser.password !== password) {
        throw new CustomError('Wrong password', 508);
    }
    return existingUser.uuid;
}


/**
 * Given a certain UUID, a name and a description, this function will create a new Group Object, and add it to the Group File.
 * @param UUID
 * @param name
 * @param description
 * @returns Writes to Group File
 */
async function createGroup(UUID, name, description) {
    const uniqueID = crypto.randomUUID();

    if (!UUID || !name || !description) {
        throw new CustomError('Bad request', 400);
    }
    const toCheck = JSON.parse(await dataMem.readGroups()).groups;
    const existingGroup = toCheck.find(group => group.id === uniqueID);

    if (existingGroup) {
        throw new CustomError('Group already exists', 503);
    }

    try {

        const currentGroups = await dataMem.readGroups();
        let groupArray = [];

        if (currentGroups) {
            groupArray = JSON.parse(currentGroups);
        }

        let group = {
            name: name,
            id: uniqueID,
            description: description,
            uuid: UUID,
            events: []
        };

        groupArray = groupArray.groups || [];
        groupArray.push(group);


        const newGroups = {groups: groupArray};

        await dataMem.writeToGroups(newGroups);

        console.log('Group created successfully');
    } catch (error) {
        throw new CustomError('Internal error', 500);
    }
}


/**
 * Deletes a certain Group given its owner's UUID, and its name. If its valid and exists, it will be deleted.
 * @param UUID
 * @param id
 * @returns Writes to Group File
 */
async function deleteGroup(UUID, id) {

    if (!UUID || !id) {
        throw new CustomError('Bad request', 400);
    }

    const toCheck = JSON.parse(await dataMem.readGroups()).groups;
    const exists = toCheck.find(group => group.id === id && group.uuid === UUID);
    if (!exists) {
        throw new CustomError('Group does not exist', 502);
    }

    const currentGroups = await dataMem.readGroups();

    let groupArray = [];
    try {
        if (currentGroups) {
            groupArray = JSON.parse(currentGroups).groups;
        }

        const idx = groupArray.findIndex(group => group.uuid === UUID && group.id === id);
        groupArray.splice(idx, 1);

        const newGroups = {groups: groupArray};
        await dataMem.writeToGroups(newGroups);
    } catch (error) {
        throw new CustomError('Internal error', 500);
    }
}

/**
 * This function adds a given event to a certain Group given its owner's UUID and the group's name.
 * -The Event is an Event Object.
 * The Event Object is fetched from the TicketMaster's API.
 * @param event
 * @param uuid
 * @param id
 * @returns Writes to Group File
 */
async function addEvent(event, uuid, id) {
    if (!event || !uuid || !id) {
        throw new CustomError('Bad request', 400);
    }
    const currentGroups = await dataMem.readGroups()
    let groupArray = JSON.parse(currentGroups).groups || [];
    const targetIndex = groupArray.findIndex(group => group.uuid === uuid && group.id === id);
    const targetGroupEvents = groupArray[targetIndex].events;
    const exists = targetGroupEvents.find(it => it.id === event.id);
    if (exists) {
        throw new CustomError('Event already exists in group', 504);
    }

    try {
        let targetEventsArray = groupArray[targetIndex].events;
        targetEventsArray.push(event);
        groupArray[targetIndex].events = targetEventsArray;
    } catch (error) {
        throw new CustomError('Internal error', 500);
    }
    const json = {
        groups: groupArray
    }
    await dataMem.writeToGroups(json)

}

/**
 * This function will fetch the most popular events from the TicketMaster API.
 * @param token
 * @param size
 * @param page
 * @returns Popular Events
 */
async function getPopularEvents(token, size, page) {
    if (!token || !size || !page) {
        throw new CustomError('Bad request', 400);
    }
    return await tmData.searchByPopularity(token, apiKey, size, page);
}

/**
 * Given a certain UUID, this function will return all the Groups associated with it.
 * @param UUID
 * @returns Group List
 */
async function listAllGroups(UUID) {
    if (!UUID) {
        throw new CustomError('Bad request', 400);
    }
    const user = JSON.parse(await dataMem.readUsers()).find(it => it.uuid === UUID);
    if (!user) {
        throw new CustomError('User does not exist', 505);
    }

    try {
        const groups = JSON.parse(await dataMem.readGroups()).groups || [];
        let groupsByUUID = [];
        groups.forEach(it => {
            if (it.uuid === UUID) {
                groupsByUUID.push(it)
            }
        });
        return groupsByUUID;

    } catch (err) {
        throw new CustomError('Internal error', 500);
    }

}


/**
 * Given a certain Group, identified by its owner's UUID and its name, this function will overwrite the current name and
 * description, replacing it by the new name and new description.
 * @param UUID
 * @param id
 * @param newName
 * @param newDescription
 * @returns Writes to Group File
 */
async function editGroup(UUID, id, newName, newDescription) {
    if (!UUID || !id || !newName || !newDescription) {
        throw new CustomError('Bad request', 400);
    }

    const Groups = await JSON.parse(await dataMem.readGroups()).groups;
    let desiredGroup = Groups.find(it => it.id === id && it.uuid === UUID);
    if (!desiredGroup) {
        throw new CustomError('Group does not exist', 502);
    }
    try {
        let updatedGroup
        if (desiredGroup) {
            updatedGroup = {
                name: newName,
                description: newDescription,
                id: desiredGroup.id,
                uuid: desiredGroup.uuid,
                events: desiredGroup.events
            }

            await deleteGroup(UUID, desiredGroup.id);
            let toWrite = await JSON.parse(await dataMem.readGroups()).groups;

            toWrite.push(updatedGroup)

            await dataMem.writeToGroups({groups: toWrite});


        }

    } catch (err) {
        throw new CustomError('Internal error', 500);
    }
}

/**
 * Given a certain groups name, and its owner's UUID,
 * this function returns the first group found with this characteristics
 * @param UUID
 * @param id
 * @returns Group
 */
async function getGroupFromUserAndName(UUID, id) {
    const groupsList = await listAllGroups(UUID);
    if (groupsList.find(it => it.id === id)) return groupsList.find(it => it.id === id);
    else throw new CustomError('Group does not exist', 502);
}


/**
 * Given a group object, if not found in the current object list, will be added to it.
 * @param group
 * @returns Writes to Group files
 */
async function addToGroups(group) {
    let groups = JSON.parse(await dataMem.readGroups()).groups || [];

    // Find the index of the existing group with the same UUID
    const existingIndex = groups.findIndex(g => g.uuid === group.uuid);

    if (existingIndex !== -1) {
        // If the group already exists, update it
        groups[existingIndex] = group;
    } else {
        // If the group doesn't exist, add it to the array
        groups.push(group);
    }

    await dataMem.writeToGroups({groups: groups});
}

/**
 * Given a certain group, identified by its owner's UUID and its name, this function removes it from the
 * groups list, effectively deleting it.
 * @param UUID
 * @param id
 * @param event
 * @returns Writes to Group File
 */
async function removeEventFromGroup(UUID, id, event) {
    if (!UUID || !id) {
        throw new CustomError('Bad request', 400);
    } else if (!event) {
        throw new CustomError('Event does not exist', 506);
    }

    const currGroupList = await listAllGroups(UUID);
    const currGroup = currGroupList.find(it => it.id === id);
    const exists = currGroup.events.find(it => it.id === event.id);
    if (!exists) {
        throw new CustomError('Event does not exist in group', 507);
    }
    let updatedEvents = currGroup.events.filter(e => e.id !== event.id);

    try {

        if (updatedEvents.length !== currGroup.events.length) {
            let updatedGroup = {
                name: currGroup.name,
                description: currGroup.description,
                id: currGroup.id,
                uuid: currGroup.uuid,
                events: updatedEvents
            };

            await deleteGroup(currGroup.uuid, currGroup.id);
            await addToGroups(updatedGroup);
        }
    } catch (error) {
        throw new CustomError('Internal error', 500);
    }
}

/**
 *  Gets details of a group, given its owner's UUID and its name.
 * @param UUID
 * @param id
 * @returns Group Details JSON
 */
async function getGroupDetails(UUID, id) {
    if (!UUID || !id) {
        throw new CustomError('Bad request', 400);
    }
    return await getGroupFromUserAndName(UUID, id);


}

/**
 * Gets event by searching for it's TicketMasterID. (uses the TicketMaster API)
 * @param id
 * @returns Event
 */
async function getEvent(id) {
    return await tmData.getDetails(id);
}

/**
 * Given a certain group, this function will return the event that has the given ID.
 * @param id
 * @param uuid
 * @param groupName
 * @returns Event
 */
async function findGroupEvent(id, uuid, groupName) {
    const group = await getGroupFromUserAndName(uuid, groupName);
    return group.events.find(it => it.id === id);
}

/**
 *  Using TicketMaster's API, this function will fetch relevant events given a certain name.
 * @param token
 * @param name
 * @param size
 * @param page
 * @returns Events
 */

async function searchByName(token, name, size, page) {
    if (!token || !name || !size || !page) {
        throw new CustomError('Bad request', 400);
    }
    return await tmData.searchByName(token, name, apiKey, size, page);
}

export {
    createUser,
    createGroup,
    addEvent,
    getPopularEvents,
    editGroup,
    deleteGroup,
    listAllGroups,
    getEvent,
    getGroupDetails,
    removeEventFromGroup,
    findGroupEvent,
    searchByName,
    loginUser
}
