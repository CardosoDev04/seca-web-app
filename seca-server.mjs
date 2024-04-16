    /**
     * This module is used to start the webserver and configure it to receive requests.
     * It starts the webserver on port 3000. (http://localhost:3000)
     */
    import * as services from './seca-services.mjs';

    const secret = "dd1a410dbed8c9d868b5babc4d707e0bb04a7965da64baab7a43e499d3be7d43";


    import express from 'express';
    import secaWebApi from './seca-web-api.mjs';
    import * as path from "path";
    import * as dataMem from "./seca-data-mem.mjs";
    import passport from 'passport';
    import LocalStrategy from 'passport-local';
    import session from 'express-session';
    import {CustomError} from "./Class Extensions/errors.mjs";


    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);

    const application = express();

    const PORT = 3000;

    application.use(express.json());


    application.use(session({
        secret: secret,
        resave: true,
        saveUninitialized: true
    }));
    application.use(passport.initialize());

    application.use(passport.session());

    application.use('/', secaWebApi());

    application.use(express.static('public'));

    application.get('*', (req, res) => {
        res.redirect('/');
    });

    application.use((req, res) => {
        res.status(404).json({error: 'Not Found'});
    });

    application.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });



    passport.serializeUser((user, done) => {
        done(null, user.uuid);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await dataMem.getUserByUUID(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });





    passport.use(new LocalStrategy(
        { passReqToCallback: true },
        async(req, username, password, done) => {
            try {
                const user = await dataMem.getUserByName(username);
                if(!user || !await services.loginUser(username,password)){
                    return done(null, false, {message: 'Incorrect username or password.'});
                }
                req.session.userToken = user.uuid
                console.log(req.session.userToken)
                return done(null, user);
            } catch (error) {
                return done(error);
            }

        }
    ));

    passport.use('local-signup', new LocalStrategy(
        async (username, password, done) => {
            try {
                const newUser = await services.createUser(username, password);

                // Return the new user object
                return done(null, newUser);
            } catch (error) {
                if(error instanceof CustomError){
                    return done(null, false, {status: error.statusCode, message: error.message});
                } else return done(error);
            }
        }
    ));




    export { application };
