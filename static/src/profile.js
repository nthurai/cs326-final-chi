(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Used for getting the current logged in user's profile information
async function getProfile() {
    const resp = await fetch(window.location.origin + '/profiles/me', {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
    });
    return resp.json();
}
exports.getProfile = getProfile;
// User for editing the personal information on a profile
// Date of Birth, weight, height, sex
async function editProfile(data) {
    let profile = await getProfile();
    Object.keys(data).forEach(key => {
        profile.data[key] = data[key];
    });
    const resp = await fetch(window.location.origin + '/profiles/update', {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(profile.data)
    });
    return resp.json();
}
exports.editProfile = editProfile;
// Used to register new profiles
async function registerProfile(data) {
    const resp = await fetch(window.location.origin + '/profiles/register', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(data)
    });
    return resp.json();
}
exports.registerProfile = registerProfile;
// Used to login to profile
async function loginProfile(data) {
    const resp = await fetch(window.location.origin + '/profiles/login', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(data)
    });
    return resp.json();
}
exports.loginProfile = loginProfile;
// Used to logout of current profile
async function logoutProfile() {
    const resp = await fetch(window.location.origin + '/profiles/logout', {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
    });
    return resp.json();
}
exports.logoutProfile = logoutProfile;
// Used to add exercises to current logged in user
async function addExercise(data) {
    const profile = await getProfile();
    profile.data.exercises.push(data);
    const resp = await fetch(window.location.origin + '/profiles/update', {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(profile.data)
    });
    return resp.json();
}
exports.addExercise = addExercise;
// Used to delete a logged in user's exercise
// You pass in the exercise name and reps. Ex: { name: "Push Ups", rep: 25 }
async function deleteExercise(data) {
    const profile = await getProfile();
    const exercises = profile.data.exercises;
    for (let i = 0; i < exercises.length; i++) {
        if (exercises[i].name.toLowerCase() === data.name.toLowerCase() && exercises[i].rep === data.rep) {
            console.log("Found it!");
            exercises.splice(i, i + 1);
            break;
        }
    }
    profile.data.exercises = exercises;
    const resp = await fetch(window.location.origin + '/profiles/update', {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(profile.data)
    });
    return resp.json();
}
exports.deleteExercise = deleteExercise;
// Used to recommend exercises to the currently logged in user
// For now it just recommends random exercises
async function recommendExercise() {
    const profile = await getProfile();
    if (!profile.data.exercises) {
        return null;
    }
    else {
        return profile.data.exercises[Math.floor(Math.random() * profile.data.exercises.length)];
    }
}
exports.recommendExercise = recommendExercise;
// Used to delete a logged in user's profile
async function deleteProfile() {
    const resp = await fetch(window.location.origin + '/profiles/delete', {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow"
    });
    return resp.json();
}
exports.deleteProfile = deleteProfile;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operations_1 = require("./operations");
$(document).ready(async () => {
    let profile = await operations_1.getProfile();
    if (!profile.success) {
        window.location.replace(window.location.origin); // Send them to front page if they're not logged in
    }
    $("#delete_profile").click(async () => {
        await operations_1.deleteProfile();
        window.location.replace(window.location.origin);
    });
    $("#edit_profile").click(async () => {
        const dob_val = $('#edit_dob').val();
        const weight_val = $('#edit_weight').val();
        const height_val = $('#edit_height').val();
        const sex_val = $('#edit_sex').val();
        const result = await operations_1.editProfile({
            dob: dob_val || $('#dob').text(),
            weight: weight_val || parseInt($('#weight').text()),
            height: height_val || $('#height').text(),
            sex: sex_val || $('#sex').text()
        });
        if (result.success === false) {
            alert(result.error);
        }
        window.location.reload();
    });
    $("#delete_exercise").click(async () => {
        await operations_1.deleteExercise({
            name: $('#delete_name').val(),
            rep: $('#delete_rep').val()
        });
        window.location.reload();
    });
    $("#add_exercise").click(async () => {
        const result = await operations_1.addExercise({
            name: $('#add_name').val(),
            rep: $("#add_rep").val(),
            date: new Date(Date.now())
        });
        if (result.success === false) {
            alert(result.error);
        }
        window.location.reload();
    });
    $("#recommend_exercise").click(async () => {
        const result = await operations_1.recommendExercise();
        if (result === null) {
            $("#insert_recommended ul").append('<li class="list-group-item">You have no exercise history</li>');
        }
        else {
            $("#insert_recommended").append('<li class="list-group-item"><span>Name: ' + result.name + " Rep Count: " + result.rep + '</span>');
        }
    });
    $("#remove_recommended").click(() => {
        $("#insert_recommended").remove();
        window.location.reload();
    });
    $("#logo_index").click(() => {
        window.location.replace(window.location.origin);
    });
    $("#logout").click(async () => {
        await operations_1.logoutProfile();
        window.location.replace(window.location.origin);
    });
    $('#userWelcome').text(profile.data.name);
    if ($("#profileSummary")) {
        $("#dob").html(profile.data.dob);
        $("#weight").html(profile.data.weight);
        $("#height").html(profile.data.height);
        $("#sex").html(profile.data.sex);
    }
    if ($("#exerciseHistory ul")) {
        const exercise = profile.data.exercises.forEach((exercise) => {
            $("#exerciseHistory ul").append('<li class="list-group-item"><span>' +
                exercise.name +
                " - " +
                exercise.rep +
                " reps" +
                '</span><span title="Delete Exercise" class="float-right"></span><span class="float-right mx-3">' +
                exercise.date +
                "</span></li>");
        });
    }
});

},{"./operations":1}]},{},[2]);
