import * as myModule from '../seca-services.mjs';
import * as dataMem from '../seca-data-mem.mjs';
import chai from 'chai';
import {addEvent} from "../seca-services.mjs";
const expect = chai.expect;

describe('seca-services Test Module', () => {

    it('Create User Test', async () => {

        await myModule.createUser("create user test", "abc12345");
        const currentUsers = JSON.parse(await dataMem.readUsers());

        const result = currentUsers[currentUsers.length - 1];
        let obj = {
            name: result.name === "create user test",
            password: result.password === "abc12345"
        };

        expect(obj).to.deep.equal({ name: true, password: true });
    });

    it('Create Groups Test', async () => {

        await myModule.createUser("test groups user", "abc12345");
        const currentUsers = JSON.parse(await dataMem.readUsers());
        const UUID = currentUsers[currentUsers.length - 1].uuid;

        await myModule.createGroup(UUID,"group_12345","test_desc")
        const currentUGroups = JSON.parse(await dataMem.readGroups()).groups;

        const result = currentUGroups[currentUGroups.length - 1];
        let obj = {
            uuid: result.uuid === UUID,
            name: result.name === "group_12345",
            description: result.description === "test_desc"
        };

        expect(obj).to.deep.equal({ uuid: true, name: true, description: true });
    });

    it('Add Event Test', async ()=>{
        //test User
        await myModule.createUser("test event user", "abc12345");
        const currentUsers = JSON.parse(await dataMem.readUsers());
        const UUID = currentUsers[currentUsers.length - 1].uuid;
        //test Group
        await myModule.createGroup(UUID,"test add event group","test_desc")
        const currentUGroups1 = JSON.parse(await dataMem.readGroups()).groups;

        const result = currentUGroups1[currentUGroups1.length - 1];


        const testEvent = {
            "id": "69420",
            "name": "Test name bro",
            "date": "2069-02-02",
            "venue": {
                "name": "Test Venue",
                "country": "Test Country",
                "city": "Test City"
            }
        }

        await myModule.addEvent(testEvent, UUID , result.name);
        const currentUGroups = JSON.parse(await dataMem.readGroups()).groups;

        let desiredEvent = currentUGroups.find((it) => it.uuid === UUID && it.name === result.name).events.find((it) => it.id === "69420" && it.name === "Test name bro");
        //console.log(desiredEvent)

        expect(desiredEvent).to.deep.equal(testEvent);


    });

    it('Edit Group', async() => {
        //test user
        await myModule.createUser("test edit group user", "abc12345");
        const currentUsers = JSON.parse(await dataMem.readUsers());
        const UUID = currentUsers[currentUsers.length - 1].uuid;
        //test Group
        await myModule.createGroup(UUID,"test edit group group","test_desc")
        const currentUGroups1 = JSON.parse(await dataMem.readGroups()).groups;

        await myModule.editGroup(UUID,"test edit group group", "new name","new desc");

        const currentUGroups = await JSON.parse(await dataMem.readGroups()).groups;
        const result = currentUGroups[currentUGroups.length - 1];
        let obj = {
            uuid: result.uuid === UUID,
            name: result.name === "new name",
            description: result.description === "new desc"
        };

        expect(obj).to.deep.equal({ uuid: true, name: true, description: true });

    })

    it('remove Event From Group Test', async ()  =>{
        await myModule.createUser("test remove event from group user","12345");
        const userlist = JSON.parse(await dataMem.readUsers());
        const user = userlist[userlist.length - 1];
        let testGroup = {
            "name": "test remove event group",
            "description": "test_desc",
            "uuid": `${user.uuid}`,
            "events": [
                {
                    "id": "123456789",
                    "name": "Test name",
                    "date": "2069-02-02",
                    "venue": {
                        "name": "Test Venue",
                        "country": "Test Country",
                        "city": "Test City"
                    }
                }
            ]
        }
        let testEvent = {
            "id": "123456789",
            "name": "Test name",
            "date": "2069-02-02",
            "venue": {
                "name": "Test Venue",
                "country": "Test Country",
                "city": "Test City"
            }
        }
        //add test group to group pool
        const currentUGroups1 = JSON.parse(await dataMem.readGroups()).groups;
        currentUGroups1.push(testGroup);
        await dataMem.writeToGroups({groups: currentUGroups1});

        await myModule.removeEventFromGroup(user.uuid, "test remove event group" ,testEvent );
        const currentUGroups = await JSON.parse(await dataMem.readGroups()).groups;

        let desiredGroup = currentUGroups.find((it) => it.uuid === user.uuid && it.name === "test remove event group");
        console.log(desiredGroup);
        let desiredEvent = desiredGroup.events.find((it) => it = testEvent);

        expect(desiredEvent).to.deep.equal(undefined);


    })

    it('Delete Group Test', async () => {
        await myModule.createUser("test delete group user","12345");
        const userlist = JSON.parse(await dataMem.readUsers());
        const user = userlist[userlist.length - 1];
        let testGroup = {
            "name": "test remove group group",
            "description": "test_desc",
            "uuid": `${user.uuid}`,
            "events": [

            ]
        }

        //add test group to group pool
        const currentUGroups1 = JSON.parse(await dataMem.readGroups()).groups;
        currentUGroups1.push(testGroup);
        await dataMem.writeToGroups({groups: currentUGroups1});

        await myModule.deleteGroup(user.uuid,"test remove group group");

        let currentUGroups = JSON.parse(await dataMem.readGroups()).groups
        let desiredGroup = currentUGroups.find((it) => it.uuid === user.uuid && it.name === "test remove group group");
        console.log(desiredGroup);

        expect(desiredGroup).to.deep.equal(undefined);

    });


});
