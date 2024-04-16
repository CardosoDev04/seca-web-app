
import {getUserToken, setUserToken} from "./Utils/auth-utils.mjs";


/**
 * This module is used to handle all the website interface functionality such as event listeners and DOM manipulation.
 */



const apiKey = 'yZezrkgZrATxTMVDlicZCocjNE4Nyqq4';

/**
 * These variables are used to keep track of the current state of the website, mainly if a user is in a group details page or not.
 * And the current group inside those details he's accessing to either remove events or just see event details
 */
let inDetails = false;
let currentGroup = null;

/**
 * This function is used to load and compile the handlebars templates from .hbs files for all the pages.
 * @param templateName
 * @returns {Promise<Handlebars.TemplateDelegate<any>>}
 */
async function loadTemplate(templateName) {
    const response = await fetch(`templates/${templateName}.hbs`);
    const templateText = await response.text();
    return Handlebars.compile(templateText);
}

/**
 * This function is used to replace the events in the grid with the ones passed as parameter.
 * @param events
 */
function replaceEventsInGrid(events) {
    $('.image-grid').empty();
    $(".error-message").empty();

    events.forEach(event => {
        $(".image-grid").append(`<div class="grid-item">
            <img src="${event.images}" alt="${event.name}" class="tile" date="${event.date}" segment="${event.segment}" genre="${event.genre}" sales="${event.sales}" id="${event.id}">
        </div>`);
    });
}

/**
 * Using jquery, we begin DOM manipulation, listening for events and handlebars template rendering.
 */
$(document).ready(async function () {

    window.onload = function() {
        window.location.href = '/';
    };

    /**
     * This function is used to get a given size list of most popular events from a given page the API.
     * We present these events in the index and main page.
     * @param apikey
     * @param size
     * @param page
     * @returns {Promise<any>}
     */
    let popularEvents = async function (apikey, size, page) {
        try {
            const response = await fetch('/events/popular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + '866ecef7-b348-4c88-ab14-2c5299d63d1f'
                },
                body: JSON.stringify({"size": size, "page": page})
            });
            if (response.status === 200) {
                const jsonData = await response.json();

                return jsonData;
            } else {
                console.error("Error:", response.statusText);
            }

        } catch (error) {
            console.log('Error fetching', error);
        }
    }
    /**
     * We load each template to be able to use them later on.
     */
    let indexTemplateCompiled = await loadTemplate("index");
    let createAccountTemplateCompiled = await loadTemplate("createAccount");
    let mainPageTemplateCompiled = await loadTemplate("mainPage");
    let loginPageTemplateCompiled = await loadTemplate("login");
    let userGroupsTemplateCompiled = await loadTemplate("myGroups");
    let createGroupTemplateCompiled = await loadTemplate("createGroup");
    let groupDetailsTemplateCompiled = await loadTemplate("groupDetails");
    let editGroupTemplateCompiled = await loadTemplate("editGroup");
    let tile_pageCompiled = await loadTemplate("tile_page");

    /**
     * Here we fetch the most popular events and render the index page with them.
     */
    let events = await popularEvents(apiKey, 30, 1);

    $(document).on('click', '.navbar-brand', function() {
        history.pushState({page: 'main'}, 'main', '/');
    })


    $("#app").html(indexTemplateCompiled({events: events}));
    history.pushState({page: 'main'}, 'main', '/index');

    /**
     * We listen for clicks on the create account button and render the create account page.
     */
    $(document).on('click', '#create-account-button', function () {
        $("#app").html(createAccountTemplateCompiled);
        history.pushState({page: 'main'}, 'main', '/account/create');

    });

    /**
     * We listen for a submission of the user-creation form which makes an API request to /users/create as to create a new user.
     */
    $(document).on('submit', '#user-creation', async function (event) {
        event.preventDefault();


        const uc_form = $(this);
        const data = new FormData(uc_form[0]);
        const username = data.get('username_input');
        const password = data.get('password_input');

        try {
            const response = await fetch('/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": username, "password": password})
            });

            if (response.status === 200) {
                console.log("User created successfully");
                try {
                    const loginResponse = await fetch('/users/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({"username": username, "password": password})
                    });

                    if (loginResponse.status === 200) {
                        const json = await loginResponse.json();
                        const token = json.token;
                        await setUserToken(token);
                        console.log("User logged in successfully " + getUserToken());
                        $("#app").html(mainPageTemplateCompiled({events: await popularEvents(apiKey, 30, 1)}));
                        history.pushState({page: 'main'}, 'main', '/main');
                    } else {
                        console.error("User login failed", loginResponse.statusText);
                    }
                } catch (error) {
                    console.log('Error fetching', error);
                }
            } else {
                if (response.status === 501) {
                    document.getElementById("error-message").innerText = "Username already exists";
                }
                console.error("User creation failed", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * We listen for clicks on the login button and render the login page.
     */
    $(document).on('click', '#login-button', function () {
        $("#app").html(loginPageTemplateCompiled);
        history.pushState({page: 'main'}, 'main', '/login');
    });

    /**
     * We listen for a submission of the user-login form which makes an API request to /users/login as to log in a user.
     */
    $(document).on('submit', '#user-login', async function (event) {
        event.preventDefault();


        const uc_form = $(this);
        const data = new FormData(uc_form[0]);
        const username = data.get('username_input');
        const password = data.get('password_input');

        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": username, "password": password})
            });

            if (response.status === 200) {
                const json = await response.json();
                const token = json.token;
                setUserToken(token);
                console.log("User logged in successfully " + getUserToken());
                $("#app").html(mainPageTemplateCompiled({events: await popularEvents(apiKey, 30, 1)}));
                history.pushState({page: 'main'}, 'main', '/main');
            } else {
                if (response.status === 505) {
                    document.getElementById("error-message").innerText = "User does not exist.";
                } else {
                    document.getElementById("error-message").innerText = "Failed to log in, check your credentials.";
                    console.error("User login failed", response.statusText);
                }
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * We listen for clicks on the logout button which removes the current user token from the session storage and renders the index page.
     */
    $(document).on('click', '#logout-button', async function () {
        setUserToken(null);
        $("#app").html(indexTemplateCompiled({events: events}));
        history.pushState({page: 'main'}, 'main', '/index');
    });

    /**
     * We listen for clicks on the my-groups button which makes an API request to /groups/list as to get the current user's groups.
     * and renders the my-groups page with the groups.
     */
    $(document).on('click', '#my-groups', async function () {
        try {
            const response = await fetch('/groups/list', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getUserToken()
                }
            });

            if (response.status === 200) {
                const json = await response.json();
                sessionStorage.setItem('currentUserGroups', json);

                $("#app").html(userGroupsTemplateCompiled({groups: json}));
                history.pushState({page: 'main'}, 'main', `/groups/`);
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }

    });

    /**
     * We listen for clicks on the delete-group button which makes an API request to /groups/delete as to delete a group.
     */

    $(document).on('click', '#delete-group', async function () {
        let id = $(this).attr('data-id');
        console.log(id);

        try {
            const response = await fetch('/groups/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({"id": id})
            });

            if (response.status === 200) {
                const updatedData = await fetch('/groups/list', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getUserToken()
                    }
                });
                if (updatedData.status === 200) {
                    const updatedJson = await updatedData.json();
                    console.log(updatedJson);
                    $("#app").html(userGroupsTemplateCompiled({groups: updatedJson}));
                    history.pushState({page: 'main'}, 'main', `/groups/`);
                } else {
                    console.error("Error fetching updated data:", response.statusText);
                }
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * We listen for clicks on the create-group button which renders the create-group page.
     */

    $(document).on('click', '#create-group', function (event) {
        event.preventDefault();
        try {
            $("#app").html(createGroupTemplateCompiled);
            history.pushState({page: 'main'}, 'main', `/user/create/group/`);
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * We listen for a submission of the create-group form which makes an API request to /groups/create as to create a new group.
     */
    $(document).on('click', '#create-group-button', async function (event) {
        event.preventDefault();

        const gc_form = document.getElementById("create-group-form");
        const data = new FormData(gc_form);
        const name = data.get('groupname_input');
        const description = data.get('group_description');

        try {
            const response = await fetch('/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({"name": name, "description": description})
            });

            if (response.status === 200) {
                // Group created successfully, now fetch the updated group list
                const updatedData = await fetch('/groups/list', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getUserToken()
                    }
                });

                if (updatedData.status === 200) {
                    const updatedJson = await updatedData.json();
                    console.log(updatedJson);
                    $("#app").html(userGroupsTemplateCompiled({groups: updatedJson}));
                    history.pushState({page: 'main'}, 'main', `/groups/`);

                } else {
                    console.error("Error fetching updated data:", updatedData.statusText);
                }
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * These next few event listeners are referring to the different type of exit buttons on the website.
     */

    $(document).on('click', '#exit-button', async function () {
        inDetails = false;
        currentGroup = null;
        $("#app").html(mainPageTemplateCompiled({events: events}));
        history.pushState({page: 'main'}, 'main', `/main`);
    });

    $(document).on('click', '#exit-to-index-button', async function () {
        inDetails = false;
        currentGroup = null;
        $("#app").html(indexTemplateCompiled({events: events}));a
        history.pushState({page: 'main'}, 'main', `/index`);
    });

    $(document).on('click', '#exit-to-main-button', async function () {
        inDetails = false;
        currentGroup = null;
        $("#app").html(mainPageTemplateCompiled({events: events}));
        history.pushState({page: 'main'}, 'main', `/main`);
    });

    $(document).on('click', '#exit-to-groups', async function () {
        inDetails = false;
        currentGroup = null;
        let groups = await (await fetch('/groups/list', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getUserToken()
            }
        })).json();
        console.log(groups)
        $("#app").html(userGroupsTemplateCompiled({groups: groups}));
        history.pushState({page: 'main'}, 'main', `/groups/`);

    });

    /**
     * We listen for clicks on the cancel-edit-group button which renders the my-groups page with the groups unchanged.
     */

    $(document).on('click', '#cancel-edit-group', async function () {
        let groups = await (await fetch('/groups/list', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getUserToken()
            }
        })).json();
        $("#app").html(userGroupsTemplateCompiled({groups: groups}));
        history.pushState({page: 'main'}, 'main', `/groups/`);
    });

    /**
     * We listen for clicks on the group details button which makes an API request to /groups/get/details as to get the details of a group.
     * Returning its name, description and events
     */
    $(document).on('click', '#details-group', async function () {
        let id = $(this).attr('data-id');

        try {
            const response = await fetch('/groups/get/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({"id": id})
            });
            if (response.status === 200) {
                const json = await response.json();
                console.log(json)

                inDetails = true;
                currentGroup = id;
                $("#app").html(groupDetailsTemplateCompiled({group: json}));
                history.pushState({page: 'main'}, 'main', `/groups/details/`);

            } else {
                console.error("Error:", response.statusText);
            }

        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * We listen for clicks on the edit-group button which makes an API request to /groups/get/details as to get the details of a group.
     * We use this to get its ID, so we can later edit it through the API with the user input.
     */
    $(document).on('click', '#edit-group', async function () {
        try {
            const id = $(this).data('id');
            const response = await fetch(`/groups/get/details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({"id": id})
            });

            if (response.status === 200) {
                const group = await response.json();
                sessionStorage.setItem('currentGroup', JSON.stringify(group));
                $("#app").html(editGroupTemplateCompiled);
                history.pushState({page: 'main'}, 'main', `/groups/edit/my-group`);
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });
    /**
     * This button confirms the edit of a group, making an API request to /groups/edit with the user input,
     * and previously fetched group ID.
     */
    $(document).on('click', '#confirm-edit-group', async function (event) {
        event.preventDefault();
        let group = JSON.parse(sessionStorage.getItem('currentGroup'));

        const gc_form = document.getElementById("edit-group-form");
        const name = document.querySelector('#group_newname').value;
        const description = document.querySelector('#group_newdescription').value;
        const id = group.id

        try {
            const response = await fetch('/groups/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({"newName": name, "newDescription": description, "id": id})
            });

            if (response.status === 200) {

                const updatedData = await fetch('/groups/list', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getUserToken()
                    }
                });

                if (updatedData.status === 200) {
                    const updatedJson = await updatedData.json();
                    console.log(updatedJson);
                    $("#app").html(userGroupsTemplateCompiled({groups: updatedJson}));
                    history.pushState({page: 'main'}, 'main', `/groups/`);
                } else {
                    console.error("Error fetching updated data:", updatedData.statusText);
                }
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log('Error fetching', error);
        }
    });

    /**
     * These next two event listeners are used to change the brightness of the tiles when the user hovers over them,
     * as well as adding an overlay with the event name, genre, subgenre and date.
     * The last function referring the tiles, is used to handle the click on a tile, which renders the tile_page template.
     */

    $(document).on('mouseenter', '.tile', function () {
        var name = $(this).attr('alt');
        var date = $(this).attr('date');
        var genre = $(this).attr('genre');
        var segment = $(this).attr('segment');
        var subGenre = $(this).attr('subgenre');
        $(this).css('filter', 'brightness(69%)');

        $(document).on('mouseenter', '.tile', function () {
            var name = $(this).attr('alt');
            var date = $(this).attr('date');
            var genre = $(this).attr('genre');
            var segment = $(this).attr('segment');
            var subGenre = $(this).attr('subgenre');
            $(this).css('filter', 'brightness(70%)');


            let nameDiv = $('<div class="image-name-overlay mt-custom mb-5 text-nowrap">' + name + '</div>');
            let genreDiv = $('<div class="image-name-overlay mt-3">' + genre + "," + segment + ',' + subGenre + '</div>');
            let dateDiv = $('<div class="image-name-overlay mt-5">' + date + '</div>');

            let parentGridItem = $(this).closest('.grid-item');
            parentGridItem.append(nameDiv, genreDiv, dateDiv);

        });

    });

    $(document).on('mouseleave', '.tile', function () {
        $(this).css('filter', ''); // Remove the filter
        $('.image-name-overlay').remove(); // Remove the name overlay
    });


    $(document).on('click', '.tile', async function () {

        console.log(inDetails);
        console.log(currentGroup)

        let name = $(this).attr('alt');
        let date = $(this).attr('date');
        let genre = $(this).attr('genre');
        let segment = $(this).attr('segment');
        let source = $(this).attr('src');
        let sales = $(this).attr('sales');
        let id = $(this).attr('id');
        let subgenre = $(this).attr('subgenre');

        console.log(id)
        console.log(sales)

        let usergroups = await (await fetch('/groups/list', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getUserToken()
            }
        })).json();
        let isLogged = getUserToken() !== null;
        $("#app").html(tile_pageCompiled({
                name: name,
                date: date,
                genre: genre,
                segment: segment,
                subgenre: subgenre,
                source: source,
                sales: sales,
                usergroups: usergroups,
                id: id,
                isLogged: isLogged,
                inDetails: inDetails,
            })
        );
        history.pushState({page: 'main'}, 'main', `/event/details/`);
    });

    /**
     * We listen for the submission of the search form which makes an API request to /events/search as to search for events by name.
     * And replace the events in the grid with the ones returned by the API.
     */

    $(document).on('submit', '#search-form', async function (event) {
        event.preventDefault();


        const search = $('#search-input').val();

        document.getElementById('popular-events-header').innerText = 'Results for: ' + search.charAt(0).toUpperCase() + search.slice(1) + '...';

        try {
            const response = await fetch('/events/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + '866ecef7-b348-4c88-ab14-2c5299d63d1f'
                },
                body: JSON.stringify({"size": 30, "page": 1, "keyword": search})
            });
            const events = await response.json();
            console.log(events)
            replaceEventsInGrid(events);

        } catch (error) {
            $('.image-grid').empty();
            $("#error-message").append(`No search results, try a different name or try again later.`);

            console.log('Error fetching', error);
        }
    });

    /**
     * These buttons are used to switch between the login and create account templates, making
     * the user experience more fluid.
     */
    $(document).on('click', '#new-user-button', function () {
        $("#app").html(createAccountTemplateCompiled);
        history.pushState({page: 'main'}, 'main', `/account/create`);
    });

    $(document).on('click', '#existing-user-button', function () {
        $("#app").html(loginPageTemplateCompiled);
        history.pushState({page: 'main'}, 'main', `/login`);
    });


    /**
     * We listen for clicks on the add-to-group button which makes an API request to /groups/add/event as to add an event to a group.
     */
    $(document).on('click', '#add-to-group', async function () {

        let idGroup = $(this).attr('gid');
        let idEvent = $(this).data('id');

        try {
            const response = await fetch('/groups/add/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({id: idGroup, eventID: idEvent})
            });

            if (response.status === 200) {
                console.log("Event added successfully")
            } else if (response.status === 504) {
                $('#message-container').html('Event already in group');
                setTimeout(function () {
                    $('#message-container').html('');
                }, 3000);
                console.log("Event already in group");
            } else {

                console.error("Error:", response.statusText, response.status);
            }
        } catch (error) {
            console.log("Error fetching")
        }
    });

    /**
     * We listen for clicks on the remove-from-group button which makes an API request to /groups/remove/event as to remove an event from a group.
     */
    $(document).on('click', '#remove-from-group', async function () {

        let idGroup = currentGroup
        let idEvent = $(this).data('id');

        console.log(idEvent)


        try {
            const response = await fetch('/groups/remove/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getUserToken()
                },
                body: JSON.stringify({id: idGroup, eventID: idEvent})
            });

            if (response.status === 200) {
                $('#message-container').html('Event removed successfully');
                setTimeout(function () {
                    $('#message-container').html('');
                }, 3000);
                console.log("Event removed successfully")
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.log("Error fetching")
        }
    });


});

