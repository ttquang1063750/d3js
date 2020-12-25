const form = document.querySelector('form');
const name = document.getElementById('name');
const parent = document.getElementById('parent');
const department = document.getElementById('department');
const modal = document.getElementById('modal');
M.Modal.init(modal);

form.addEventListener('submit', e => {
    e.preventDefault();

    db.collection('tree')
        .add({
            name: name.value,
            parent: parent.value,
            department: department.value
        })
        .then(() => {
            form.reset();
            const modalInstance = M.Modal.getInstance(modal);
            modalInstance.close();
        });
});

