const   express = require('express'),
        app = express();
        bodyParser = require('body-parser'),
        favicon = require('serve-favicon'),
        GoogleSpreadsheet = require('google-spreadsheet'),
        { promisify } = require('util'),
        creds = require('./client_secret.json'),
        docId = '1kdVLZIw6DOQ2jg62d5d1k4ZheTkmI_bAA9Oh3nqydUs';
        
const PORT = process.env.PORT || 5000

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');
app.use(express.static('public'));
app.use( bodyParser.json() );
app.use(favicon('favicon.ico'))


app.get('/admin', function(req, res){
    (async () => {
        var account = xoa_dau((req.query.account || '').trim());
        var data = await getDataByAccount(account);
        try {
            res.render('admin', {
                account: account,
                rows: data,
                error: null
            })
        } catch (error) {
            console.log(error);
            res.render('admin', {
                account:req,
                rows: [],
                error: null
            })
        }     
    })()
});

app.get('/search', function(req, res){
    (async () => {
        var account = xoa_dau((req.query.account || '').trim());
        var data = await getDataByAccount(account);
        try {
            res.render('result', {
                account: account,
                rows: data,
                error: null
            })
        } catch (error) {
            console.log(error);
            res.render('result', {
                account:req,
                rows: [],
                error: null
            })
        }     
    })()
});

app.post('/payment', function(req, res) {
    (async () => {        
        var account = xoa_dau((req.body.account || '').trim()),
            sheet = req.body.sheet,
            code = req.body.code,
            isPaid = req.body.paid;

        var data = await getDataByAccount(account, sheet);

        var line = data.find(x => x.code == code);
        if(line){
            line.pay = isPaid ? line.price : 0;
            line.save();
        }
        res.sendStatus(200);
    })()
})

app.post('/remark', function(req, res) {
    (async () => {        
        var account = xoa_dau((req.body.account || '').trim()),
            sheet = req.body.sheet,
            code = req.body.code,
            remark = req.body.remark;

        var data = await getDataByAccount(account, sheet);

        var line = data.find(x => x.code == code);
        if(line){
            line.remark = remark;
            line.save();
        }
        res.sendStatus(200);
    })()
})

app.get('/clear-price', function(req, res) {
    (async () => {        
        var account = xoa_dau((req.query.account || '').trim());
        var sheet = req.query.sheet;

        var data = await getDataByAccount(account, sheet);

        data.forEach(row => {
            row.pay = row.price = 0;
            row.save();
        });
        res.sendStatus(200);
    })()
})

app.get('/', function(req, res){
    res.render('index')
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


async function getDataByAccount(account, sheetName) {
    const doc = new GoogleSpreadsheet(docId);
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    let data = [];

    try {
        for (let i = 0; i < info.worksheets.length; i++) {
            let sheet = info.worksheets[i];
            if(sheetName && sheet.title != sheetName){
                continue;
            }
            
            let rows = await promisify(sheet.getRows)({
                offset: 1,
                limit: 200,
                query: 'price > 0' + `${ account == 'full' ? '' : ' & account = "' + account + '"'}` + `${ sheetName ? '' : ' & pay = 0' }`
            });

            if(rows.length > 0){                
                rows.forEach(row => {
                    row.sheet = sheet.title
                });
                data.push(...rows);
            }
        }
    } catch (error) {
        console.log(error);
    }
    return data;
}

function xoa_dau(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}