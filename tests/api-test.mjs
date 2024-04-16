
import express from 'express';
import secaWebApi from '../seca-web-api.mjs';
import * as path from "path";
import request from'supertest';
import assert from 'assert';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const application = express();

const PORT = 3000;

application.use(express.json());

application.use('/', secaWebApi());

application.use(express.static('public'));

application.use((req, res) => {
    res.status(404).json({error: 'Not Found'});
});


const app = secaWebApi();

describe('SECA Web API Tests', () => {
    it('should create a new user', (done) => {
        request(application)
            .post('/users/create')
            .send({ username: 'test424', password: 'testpassword' })
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(res.body.message, 'User created successfully');
                done();
            });
    });

    it('should create a new group', (done) => {

        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        request(application)
            .post('/groups/create')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ name: 'test_group1', description: 'hello' })
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(res.body.message, 'Group created successfully');
                done();
            });
    });


    it('should log in a user', (done) => {
        request(application)
            .post('/users/login')
            .send({ username: 'admin', password: '123' })
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.ok(res.body.token);
                done();
            });
    });

    it('should list all groups with a valid bearer token', (done) => {
        // admin bearer token
        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        request(application)
            .get('/groups/list')
            .set('Authorization', `Bearer ${bearerToken}`)
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(Array.isArray(res.body), true);
                done();
            });
    });

    it('should add an event to a group', (done) => {

        const eventId = 'G5v0Z9Yc3R8zK';
        const groupId = '7434d98b-1422-47c6-97f5-419d59781ea0';

        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        request(application)
            .post('/groups/add/event')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ id: groupId, eventID: eventId })
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(res.body.message, 'Event added successfully');
                done();
            });
    });

    it('should remove event from group', (done) => {

        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        const eventId = 'G5v0Z9Yc3R8zK';
        const groupId = '7434d98b-1422-47c6-97f5-419d59781ea0';

        request(application)
            .post('/events/remove/event')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ id: groupId, eventID: eventId})
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(Array.isArray(res.body), true);
                done();
            });
    });

    it('should search for events by name', (done) => {

        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        request(application)
            .post('/events/search')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ size: 5, page: 1, keyword: 'football' })
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(Array.isArray(res.body), true);
                done();
            });
    });

    it('should get popular events', (done) => {

        const bearerToken = '866ecef7-b348-4c88-ab14-2c5299d63d1f';

        request(application)
            .post('/events/popular')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ size: 5, page: 1})
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(Array.isArray(res.body), true);
                done();
            });
    });

    it('should say 404 "Not Found"', (done) => {
        request(application)
            .get('/nonexistent-route')
            .expect(404)
            .end((err, res) => {
                assert.strictEqual(err, null);
                assert.strictEqual(res.body.error, 'Not Found');
                done();
            });
    });
});
