import * as services from './seca-services.mjs';
import * as express from 'express';
import {CustomError} from "./Class Extensions/errors.mjs";
import passport from 'passport';


/**
 * This module is used to configure the SECA API Routes, and handle the requests and respective errors.
 * It interacts directly with the service module.
 */


//--------------------Helper functions--------------------//


/**
 * This function is used to get the token from the request's Authorization header.
 * @param req
 * @returns Bearer Token
 */
async function getToken(req) {
    const token = await req.get("Authorization")
    const split = token.split(" ")[1];
    return split
}

// This is the express router that will be exported
const expressRouter = express.Router();

/**
 * This function is used to catch the errors and send the respective responses.
 * @param error
 * @param res
 */
function errorCatching(error, res) {
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({error: error.message});

    } else if (error instanceof Error) {
        res.status(500).json({error: 'Internal error'});

    }
}


//--------------------MAIN FUNCTIONS--------------------//

export default () => {
    expressRouter.post('/users/create', async (req, res) => {
        try {
            const {username, password} = req.body;
            await services.createUser(username, password, res);
            res.status(200).json({message: 'User created successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/users/login', passport.authenticate('local'), (req, res) => {
        console.log(req)
        const token = req.user.uuid
        console.log(token)
        res.status(200).json({ token: token });
    });
    expressRouter.post('/groups/create', async (req, res) => {


        try {
            const {name, description} = req.body;
            const UUID = await getToken(req);
            await services.createGroup(UUID, name, description);
            res.status(200).json({message: 'Group created successfully'});
        } catch (error) {
            errorCatching(error, res);
        }

    });


    expressRouter.post('/groups/delete', async (req, res) => {
        try {
            const {id} = req.body;
            const UUID = await getToken(req);
            await services.deleteGroup(UUID, id);
            res.status(200).json({message: 'Group deleted successfully'});
        } catch (error) {
            errorCatching(error, res);
        }

    });

    expressRouter.post('/groups/edit', async (req, res) => {
        try {
            const {id, newName, newDescription} = req.body;
            const UUID = await getToken(req);
            await services.editGroup(UUID, id, newName, newDescription, res);
            res.status(200).json({message: 'Group edited successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.get('/groups/list', async (req, res) => {

        try {
            const UUID = await getToken(req);
            const groups = await services.listAllGroups(UUID);
            res.status(200).json(groups);
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/get/details', async (req, res) => {
        try {
            const {id} = req.body;
            const UUID = await getToken(req);
            const groupDetails = await services.getGroupDetails(UUID, id);
            res.status(200).json(groupDetails);
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/add/event', async (req, res) => {

        try {
            const {id, eventID} = req.body;
            const UUID = await getToken(req);
            const event = await services.getEvent(eventID);
            await services.addEvent(event, UUID, id);
            res.status(200).json({message: 'Event added successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });

    expressRouter.post('/groups/remove/event', async (req, res) => {
        try {
            const {id, eventID} = req.body;
            const UUID = await getToken(req);
            const event = await services.findGroupEvent(eventID, UUID, id);
            await services.removeEventFromGroup(UUID, id, event, res);
            res.status(200).json({message: 'Event removed successfully'});
        } catch (error) {
            errorCatching(error, res);
        }
    });


    expressRouter.post('/events/popular', async (req, res) => {
        try {
            const UUID = await getToken(req);
            const {size, page} = req.body;
            const events = await services.getPopularEvents(UUID, size, page, res);
            res.status(200).json(events);
        } catch (error) {
            errorCatching(error, res);
        }
    });


    expressRouter.post('/events/search', async (req, res) => {
        try {
            const UUID = await getToken(req);
            const {size, page, keyword} = req.body;
            const events = await services.searchByName(UUID, keyword, size, page);
            res.status(200).json(events);
        } catch (error) {
            errorCatching(error, res);
        }
    });


    return expressRouter;

}