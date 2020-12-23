const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAction = form.querySelector('span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

let activity = 'cycling';
btns.forEach(btn => {
    btn.addEventListener('click', e => {
        // Get activity
        activity = e.target.dataset.activity;

        // Remove and add active class
        btns.forEach(b => b.classList.remove('active'));

        e.target.classList.add('active');

        // Set id of input field
        input.setAttribute('id', activity);

        // Set text of form span
        formAction.textContent = activity;
        update(data);
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const distance = parseInt(input.value, 10);
    if (distance) {
        db.collection('activities')
            .add({
                distance,
                activity,
                date: new Date().toString()
            })
            .then(() => {
                error.textContent = '';
                input.value = '';
            });
    } else {
        error.textContent = 'Please enter a valid distance';
    }
});
