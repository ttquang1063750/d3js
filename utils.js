function getContrast(hexColor = '#FFFFFF', limit = 200) {
    // If a leading # is provided, remove it
    if (hexColor.slice(0, 1) === '#') {
        hexColor = hexColor.slice(1);
    }

    // If a three-character hexcode, make six-character
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map((hex) => {
            return hex + hex;
        }).join('');
    }

    // Convert to RGB value
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Get YIQ ratio
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Check contrast
    return (yiq >= limit) ? 'black' : 'white';
}


function bindDb(db, collection, cb) {
    let data = [];
    db.collection(collection).onSnapshot(res => {
        res.docChanges().forEach(change => {
            const doc = {...change.doc.data(), id: change.doc.id};
            switch (change.type) {
                case 'added':
                    data.push(doc);
                    break;
                case 'modified':
                    const index = data.findIndex(item => item.id === doc.id);
                    data[index] = doc;
                    break;
                case 'removed':
                    data = data.filter(item => item.id !== doc.id);
                    break;
                default:
                    break;
            }
        });

        cb(data);
    });
}
