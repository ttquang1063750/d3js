const form = document.querySelector('form');
const name = document.getElementById('name');
const cost = document.getElementById('cost');
const error = document.getElementById('error');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(name.value && cost.value) {
        const item = {
            name: name.value,
            cost: parseInt(cost.value, 10)
        };

        db.collection('expenses').add(item).then(() => {
            error.textContent = '';
            name.value = '';
            cost.value = '';
        })
    }else {
        error.textContent = 'Please enter values before submitting!';
    }
});
