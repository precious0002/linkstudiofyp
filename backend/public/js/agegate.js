function checkAge() {
    // modified code (CodePen, Manzoor, n.d.).
    // Get the value entered by the user from the input field
    var userAge = document.getElementById('userAge').value;

    if (userAge && userAge >= 13) {
        window.location.href = 'comguidelines.html';
    } else {
        alert('Sorry, you must be at least 13 years old to access this content.');
    }
}