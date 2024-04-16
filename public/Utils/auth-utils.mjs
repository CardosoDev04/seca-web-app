
function setUserToken(token) {
    return localStorage.setItem("userToken", token)
}


function getUserToken() {
    return localStorage.getItem("userToken")
}


export {
    setUserToken,
    getUserToken,
}