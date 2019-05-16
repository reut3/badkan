// This line should be the same as in myExercises.js.

var BACKEND_PORTS = [5670, 5671, 5672, 5673, 5674, 5675, 5676, 5677, 5678, 5679];
var BACKEND_FILE_PORTS = [9000];

//var BACKEND_PORTS = [5670];

/**
 * From there, he can:
 * - Edit the exercise.
 * - Run a code of any user of all of them.
 * - Read and edit any file of any user.
 * - Run the moss command.
 * - dl the summary of the input/output of the student.
 */
//let exerciseId = JSON.`pa`rse(localStorage.getItem("selectedValue"));
//let exercise = JSON.parse(localStorage.getItem("exercise"));

var exerciseId = getParameterByName("exerciseId"); // in utils.js
if (!exerciseId)
    exerciseId = "multiply"; // default exercise

let peerExercisesMap = new Map(JSON.parse(localStorage.getItem("peerExercisesMap")));
let exercise = peerExercisesMap.get(exerciseId);

let usersMap = new Map(JSON.parse(localStorage.getItem("usersMap")));

let course = JSON.parse(localStorage.getItem("courseForGrader"));

let homeUserId = JSON.parse(localStorage.getItem("homeUserId"));
let homeUser = JSON.parse(localStorage.getItem("homeUserKey"));


if ((exercise.ownerId != homeUserId && homeUserId != "l54uXZrXdrZDTcDb2zMwObhXbxm1") &&
    !(course.ownerId == exercise.ownerId && course.grader == homeUser.id)) {
    alert("You have no access to this page...");
    document.location.href = "manageCourses.html";
}

$("#exercise").html(exercise.name);

document.getElementById("exName").defaultValue = exercise.name
document.getElementById("exNameZip").defaultValue = exercise.name

document.getElementById("exDescr").defaultValue = exercise.description
document.getElementById("exDescrZip").defaultValue = exercise.description

document.getElementById("minTest").defaultValue = exercise.minTest


if (exercise.submission) {
    document.getElementById("githubGitHub").checked = exercise.submission.github
    document.getElementById("githubZip").checked = exercise.submission.github

    document.getElementById("zipGitHub").checked = exercise.submission.zip
    document.getElementById("zipZip").checked = exercise.submission.zip

    document.getElementById("gitlabGitHub").checked = exercise.submission.gitlab
    document.getElementById("gitlabZip").checked = exercise.submission.gitlab
}


if (exercise.link == 'zip') {
    document.getElementById("git").style.display = "none";
    document.getElementById("zip").style.display = "block";
} else {
    document.getElementById("git").style.display = "block";
    document.getElementById("zip").style.display = "none";
}

document.getElementById("signatures").defaultValue = exercise.signatures

let html_text = "";
/*
// usersMap.get is undefined iff there are no users registered to the course.
// TODO: Handle this case more precisely
console.log(usersMap);
for (var i = 1; i < exercise.grades.gradeObj.length; i++) {
    var currentUser = usersMap.get(exercise.grades.gradeObj[i].id)
    //console.log(currentUser)
    if (currentUser) {
        html_text +=
            "<button name =\"" + exercise.grades.gradeObj[i].id + "\" id=\"exercise\" class=\"btn btn-link\">" +
            currentUser.name + " " +
            currentUser.lastName + " " +
            currentUser.id +
            "</button>";
        html_text += "<br />";
    }
}
*/

if (html_text) {
    $("#submissions").append(html_text);
} else {
    $("#submissions").append("There is no submission yet.");
}

document.getElementById("loading").style.display = "none";


$('body').on('click', '#exercise', function (e) {
    let userId = e.target.name;
    let user = usersMap.get(userId);
    localStorage.setItem("userId", JSON.stringify(userId));
    localStorage.setItem("user", JSON.stringify(user));
    document.location.href = "manageExercise.html?exerciseId=" + exerciseId;
});



/**
 * BUTTON CONFIRM (SAVE CHANGES).
 */
document.getElementById("btnEdit").addEventListener('click', e => {
    const name = escapeHtml(document.getElementById("exName").value);
    const descr = escapeHtml(document.getElementById("exDescr").value);
    const minTest = escapeHtml(document.getElementById("minTest").value);
    const signatures = escapeHtml(document.getElementById("signatures").value)

    let githubGitHub = document.getElementById("githubGitHub").checked;
    let zipGitHub = document.getElementById("zipGitHub").checked;
    let gitlabGitHub = document.getElementById("gitlabGitHub").checked;

    // Here we first check that the user at least check one of the parameter.
    if (!githubGitHub && !zipGitHub && !gitlabGitHub) {
        alert("Please check at least one submission option.");
        return;
    }

    let submissionGitHub = new Submission(githubGitHub, zipGitHub, gitlabGitHub);

    if (checkEmptyFields(name, descr, signatures,minTest)) {
        var pdf = document.getElementById('instructionGIT').files[0];
        if (pdf) {
            exercise.example = "PDF"
        }
        uploadExercise(name, descr, minTest ,signatures);
        editPdf(pdf);
    }
});

function checkEmptyFields(name, descr ,signatures,minTest) {
    var emptyField = document.getElementById("emptyField");
    if (name === "" || descr === "" || minTest === "" || signatures === "") {
        emptyField.className = "show";
        setTimeout(function () {
            emptyField.className = emptyField.className.replace("show", "");
        }, 2500);
        return false;
    }
    return true;
}

function editPdf(file) {
    if (file) {
        storage.ref(exerciseId).put(file).then(function (snapshot) {
            pullSuccess.className = "show";
            setTimeout(function () {
                pullSuccess.className = pullSuccess.className.replace("show", "");
            }, 2500);
        }).catch(error => {
            alert(error)
        })
    } else {
        pullSuccess.className = "show";
        setTimeout(function () {
            pullSuccess.className = pullSuccess.className.replace("show", "");
        }, 2500);
    }
}


function uploadExercise(name, descr, minTest ,signatures) {
    // The ref of the folder must be PK.
    var user = firebase.auth().currentUser;
    let ex= new PeerExercise(name, descr, exercise.ownerId, exercise.peerGrades, exercise.deadlineTest,
        exercise.deadlineSolution, exercise.deadlineConflicts, exercise.compilerSolution, exercise.compilerTest, exercise.submission, minTest, signatures)
    incrementEditExWithoutCommingHome(user.uid, homeUser);
    writeExercise(ex, exerciseId);
}


document.getElementById("btnDeleteEx").addEventListener('click', e => {
    var r = confirm("Are you sure to delete this exercise?");
    if (r == true) {
        deleteExerciseById(exerciseId);
        document.location.href = "manageCourses.html";
    }
});

