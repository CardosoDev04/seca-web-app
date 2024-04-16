# Shows & Events Chelas Application

This is the repository for the Shows & Events Chelas Application, an application developed throughout the first semester of the 23/24 school year, in regards to the subject IPW (Introduction to Web Programming). <br>
The work hereby displayed was a result of a joint effort between two collegues of class 32D, and was developed with a lot of thought put into it. <br>
In this project you can find a fully functional full stack web application, robust API and a document database backend. <br>
The project mainly consists of two important parts (as any other full stack application), a backend and a frontend. <br>
<br>
The main technologies used were:

- ES6+ JavaScript
- NodeJS
- ExpressJS
- HandlebarsJS
- Bootstrap CSS
- ElasticSearch DB
- RESTful API Principles
<br>
The application consists of an Event application, where the user can:

- Create an account
- Log in
- Search for events
- See what's popular
- Create, see details, edit and delete (CRUD) groups to group events by

![Logo](https://www.isel.pt/sites/default/files/NoPath%20-%20Copy%402x_0.png)

## Authors

- [João Cardoso](https://github.com/CardosoDev04)
- [Gonçalo Ferraz](https://github.com/gongas123lol)
  

# Table of Contents

1. [The Backend](#the-backend)
2. [The Frontend](#the-frontend)
3. [Run Locally](#instructions-to-run-locally)
4. [Data Structure and Storage Design](#data-structure-and-storage-design)
5. [Mapping between Database Objects and Web Application Data Model](#mapping-between-database-objects-and-web-application-data-model)
6. [To Run the Tests](#to-run-the-tests)
7. [SECA API Reference](#seca-api-reference)

# The backend

The backend of this application consists mainly of three important parts.

The first of these (and the first to be developed) is the API that supports all the CRUD operations the application makes use of.
The API itself was developed using NodeJS and ExpressJS.

Usage of NodeJS:
 - Apart from it being the most widely used backend convention, NodeJS was used in our project mainly for ES6+ conventions and modularizing the workload. We see this in our division of different parts of the application in different modules, present in our applications hierarchy.
 - It was also a big factor in defining the component hierarchy, since it allowed us to only call specific modules where they were needed and define a clear module dependency tree.

Usage of ExpressJS:

- Being a well-known to be great framework for server creation and management, Express was the foundation of our backend and it was using it that we were able to start up the web-server, configure authentication sessions, serve the frontend publicly, and above all define API routes and endpoints.


## Backend structure

The structure of our backend goes as follows:

![backenddiagramfinished drawio](https://github.com/isel-leic-ipw/seca-ipw-p1-leic2324i-ipw32d-g13/assets/122165256/5912aefd-caa9-4c22-9971-45fca096d7a7)




As we can see from the diagram we have 5 main modules (represented by full lines), an auxiliary module, the frontend being served which is handled separately by itself and a configured ElasticSearch DB to store our information documents.






## Main modules

### The Datamem Module
 - This module defines the interaction with the ElasticSearch Database, making CRUD operations possible. It's also through the use of this module that the application administrator initializes the data structure in the database to match the use in the rest of the app.
   It can be found in the root project directory by the name of "seca-data-mem.mjs"
   
### Server Module
 - This module defines the Express application which constitutes the starting and maintaining of the webserver itself, the initialization and handling of the authentication strategy implemented with PassportJS framework's local strategy and finally it defines which routes and folders are to be served to the end user (such as the '/' route and the public folder), effectively also serving the frontend.
   It can be found in the root project directory by the name of "seca-server.mjs"

### Services Module
 - This module defines all the functionality of the application, it is used to manage all functional requests (such as all the CRUD operations) even those who require interaction with the other more "basic" modules. It's the "wagon pull" of the entire application. Every functionality the end user or the application administrator is able to perform while logged in or out (besides creating an account) is managed in this module.
   It can be found in the root project directory by the name of "seca-services.mjs"

### API Module
 - This module defines all the routes and endpoints of the SECA WEB API, it's the foundational module to which all requests go through when performing a CRUD operation on the application. In this module, an Express Router is defined to handle all incoming requests and route them according to the request URL. The module interacts with other modules such as the Services Module and the Authentication Module.
   It can be found in the root project directory by the name of "seca-web-api.mjs"
   
### TicketMaster Module

 - This module's name is fairly self explanatory, it defines and contains all interactions with the TicketMaster API to fetch event data. It is our application's connection to the essential data it uses to function. This module allows us to search for events by name, popularity and to get a specific event based on ID.
   It can be found in the root project directory by the name of "tm-events-data.mjs"






## Auxiliary Modules

### Authentication Module (Utilitary)
 - This module is extremely straight to the point. All it does it allow the local storage item called "userToken" to be get/set to the current UUID of the user returned by the API after passport authentication. This is so the client side can make use of the user token, that was set by the server side, while the session is active. Once the page reloads this token is discarded and a new one will need to be set by the server


### Error Module
 - This module (while not defined in the diagram), is used throughout the application as it's CustomError class is how we handle different types of errors and respond to them accordingly. The CustomError class extends the default Error class adding a status code and error message.
   





# The frontend

The frontend part of the project consists of everything thats inside the "public" folder. 
The three main elements are the Website module (Regular ES6+ JS module), the index.html file and the Handlebars templates folder.

## Frontend Structure
![frontend drawio](https://github.com/isel-leic-ipw/seca-ipw-p1-leic2324i-ipw32d-g13/assets/122165256/0fa5d394-98d6-4ec0-b1ca-5e175d7936bc)


# Files

## The index.html file
 - This file defines the structure and script imports of the whole frontend, as well as the <div> that is used to render the website components. In this file we import Handlebars.js framework for templating and dynamic rendering, Bootstrap 5 Bundle (Bootstrap + PopperJS + jQuery) for CSS styling and base components and jQuery for better javascript DOM manipulation readability.

## Handlebars Template Folder
 - This folder contains all the Handlebars (.hbs) templates, which contain the structure for all of the different pages. These pages are separated into different Handlebars templates so they can be dynamically rendered by the server and the values within dynamically updated by the end user, kind of like components act in ReactJS development but instead of having different components separated and then joint together into a page, we have different pages separated and joint together into a website.
   
## Website Module
 - This is the foundational client-side module, which determines how the end user interacts with the application on an interface level. The website module handles all DOM manipulation and event listening / handling. This module also handles URL redirecting based on template rendering, since our application is designed as an SPA (Single Page Application) with dynamic rendering and "faux page redirections". This module is what allows the user interaction to make changes on the server side (given that the user is permitted to do so).

## The styles.css
 - Asides from the inline Bootstrap styling (in the .hbs files), this file defines all the specific modifications that needed to be done in regards to the CSS of certain components that (even though having a default component as a base) needed tweaking.


# Data Structure and Storage Design

The design of how we structured our data goes as follows on the diagram below:

![datastructure drawio](https://github.com/isel-leic-ipw/seca-ipw-p1-leic2324i-ipw32d-g13/assets/122165256/70df3b67-c167-49b7-a210-5a88954b7494)

Our ElasticSearch Database includes two indices, one for users and one for groups. <br>
Each index contains one document referring to it. The users index contains a document called "users" with the ID of 1, the groups index similarly contains a document called "groups" with and ID of 2.
The way we insert data into our database is through these documents' re-writing, bringing the number of documents down to 1 instead of a document for each entry. We chose this path of data modelling as this project takes a smaller scale, so there's no need to account for the "data writing performance" issues that re-writting the documents would cause. This way we can also keep our data more accessible, it was essentially a choice based on project specifications.

## The users document
- The groups document contains a JSON description of the users array, each user is caracterized by it's user name, uuid and password.
```json
{
  "name": "admin",
  "uuid": "866ecef7-b348-4c88-ab14-2c5299d63d1f",
  "password": "123"
}
```

## The groups document
 - The groups document contains a JSON description of the groups array, each group is caracterized by it's name, unique group ID, description, uuid of owner and events array.

  ```json
{
  "name": "123",
  "id": "f4f9e8b4-14c1-46bc-83df-10cca5bda3ce",
  "description": "abc",
  "uuid": "866ecef7-b348-4c88-ab14-2c5299d63d1f",
  "events": []
}
```

# Mapping between Database Objects and Web Application Data Model
The mapping between the Elasticsearch's SECA documents and the web application objects model is as follows:

- **Users Index**: The 'users' index in Elasticsearch corresponds to the User objects in the web application. Each User object has properties such as 'name', 'uuid', and 'password'. These properties are stored as fields in the 'users' document in Elasticsearch. The 'users' document is a JSON object that contains an array of User objects. The `writeToUsers` function is used to write User objects to the 'users' index, and the `readUsers` function is used to read User objects from the 'users' index.

- **Groups Index**: The 'groups' index in Elasticsearch corresponds to the Group objects in the web application. The exact structure of a Group object is not explicitly defined in the provided code, but it's likely to be a JSON object that represents group data. These properties are stored as fields in the 'groups' document in Elasticsearch. The 'groups' document is a JSON object that likely contains an array of Group objects. The `writeToGroups` function is used to write Group objects to the 'groups' index, and the `readGroups` function is used to read Group objects from the 'groups' index.

Then, after gathering all information from the database's documents, this information is used throughout the application with the exact same structure as to avoid conflict between function calls and provide better readability.

# Instructions to run Locally

The instructions below should be fairly simple to follow, please make sure that you run these in order and wait for each one to complete before proceeding to the next.

## Clone the project

```bash
  git clone https://github.com/isel-leic-ipw/seca-ipw-p1-leic2324i-ipw32d-g13
```

## Go to the project directory

```bash
  cd my-project
```

## Install dependencies

```bash
  npm install
```

Configure your elasticsearch.yml file to use http, no ssl and
to be run on localhost:9200/ , or just use the provided .yml file. 

## Go to the elasticsearch bin directory
```bash
cd ..\elasticsearch-8.11.1\bin
```

## Start the elasticsearch server
```bash
  elasticsearch.bat
```
## Uncomment the line for database initialization
```bash
cd my-project
```
Edit the seca-data-mem.mjs file and uncommented the commented line at the bottom according to the instructions in the block comment.

## Run the database initalization
This will provide the application with "starter" data, it will make it so there is one user (username: admin, password: 123, uuid:866ecef7-b348-4c88-ab14-2c5299d63d1f) and one group (id: f4f9e8b4-14c1-46bc-83df-10cca5bda3ce, name:123, description: abc, events: []).
```bash
npm run seca-data-mem.mjs
```

## Comment the previously uncommented line again.

## Start the server

```bash
  npm run seca-server.mjs
```

## Navigate to localhost:3000 and you'll be able to use the web application in it's entirety.


# To run the tests

## Postman Collection
 We have provided a Postman client collection to verify all API routes, this test should be performed as follows:
- Start the application as mentioned in the run instructions.
- Open Postman, and open the Postman collection located in the Postman directory of the project.
- Open the collection provided in this folder.
- Run each request in order to see the results. (THE ORDER IS VERY IMPORTANT)

## Test modules
We have made available two Javascript test modules in a folder named "test" inside the project directory.
These can be run directly from your IDE or by:
```bash
cd my-project
cd tests
npm run test-services / api-test
```
Note: The / in the last npm command instruction signifies you can run either one with the same procedure, only run one instruction at a time and wait for the test results.





# SECA API Reference

### Create a new user

**POST /users/create**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username`| `string` | **Required**. User's username |
| `password`| `string` | **Required**. User's password |

#### Responses

- **200:** User created successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **501:** User Already Exists

### Log in a user

**POST /users/login**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username`| `string` | **Required**. User's username |
| `password`| `string` | **Required**. User's password |

#### Responses

- **200:** User logged in successfully (Returns JWT token)
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **505:** User Does Not Exist or Incorrect Password

### Delete a group

**POST /groups/delete**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `string` | **Required**. Group ID      |

#### Responses

- **200:** Group deleted successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **502:** Group Does Not Exist

### Create a new group

**POST /groups/create**

| Parameter   | Type     | Description                |
| :---------- | :------- | :------------------------- |
| `name`      | `string` | **Required**. Group name   |
| `description`| `string`| Group description          |

#### Responses

- **200:** Group created successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **501:** Group Already Exists

### Edit a group

**POST /groups/edit**

| Parameter    | Type     | Description                             |
| :----------- | :------- | :-------------------------------------- |
| `id`         | `string` | **Required**. Existing group ID         |
| `newName`    | `string` | New group name (optional)               |
| `newDescription`| `string`| New group description (optional)       |

#### Responses

- **200:** Group edited successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **502:** Group Does Not Exist

### List all groups

**POST /groups/list**

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
| (No parameters) | - | - |

#### Responses

- **200:** Groups listed successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **501:** User Does Not Exist

### Get details from group

**POST /groups/get/details**

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
| `id`      | `string` | **Required**. Group ID  |

#### Responses

- **200:** Group details retrieved successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **502:** Group Does Not Exist

### Add an event to a group

**POST /groups/add/event**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `string` | **Required**. Group ID      |
| `eventID` | `string` | **Required**. Event ID     |

#### Responses

- **200:** Event added to group successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **504:** Event Already Exists in Group
- **502:** Group Does Not Exist

### Remove an event from a group

**POST /groups/remove/event**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `string` | **Required**. Group ID      |
| `eventID` | `string` | **Required**. Event ID     |

#### Responses

- **200:** Event removed from group successfully
- **400:** Bad request, invalid parameters
- **500:** Internal Error
- **506:** Event Does Not Exist
- **507:** Event Does Not Exist In Group

### List the most popular events

**POST /events/popular**

| Parameter | Type     | Description                         |
| :-------- | :------- | :---------------------------------- |
| `apiKey`  | `string` | **Required**. API Key for authorization |
| `size`    | `integer`| Number of events to retrieve (optional, default: 30) |
| `page`    | `integer`| Page number (optional, default: 1)   |

#### Responses

- **200:** Lists the "size" most popular events of the "page" page
- **400:** Bad request, invalid parameters
- **500:** Internal Error

### Search for events

**POST /events/search**

| Parameter | Type     | Description                         |
| :-------- | :------- | :---------------------------------- |
| `apiKey`  | `string` | **Required**. API Key for authorization |
| `size`    | `integer`| Number of events to retrieve (optional, default: 30) |
| `page`    | `integer`| Page number (optional, default: 1)   |
| `keyword` | `string` | **Required**. Search keyword         |

#### Responses

- **200:** Lists the "size" number of events of the "page" page associated with the keyword.
- **400:** Bad request, invalid parameters
- **500:** Internal Error


