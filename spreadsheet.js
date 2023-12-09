
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet('1E2MxDD7BuYWVKqiGh_qNg7DkxLeoKFjG_8NlhwtjXxY');
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[3];

    // console.log(`Title: ${sheet.title}, Rows: ${sheet.rowCount}`);

    // const rows = await promisify(sheet.getRows)({
    //     offset: 1,
    //     limit: 10,
    //     query: 'studentname = Brent'
    // });

    // rows[0].del()

    // const row = {
    //     a: 'a',
    //     b: 'b'
    // }

    // await promisify(sheet.addRow)(row);

    const cells = await promisify(sheet.getCells)({
        'min-row': 1,
        'max-row': 5,
        'min-col': 1,
        'max-col': 2
    })

    for(const cell of cells){
        console.log(`${cell.row}, ${cell.col}: ${cell.value}`);
    }
    
    // console.log(rows);
}

accessSpreadsheet()