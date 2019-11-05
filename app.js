var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs')
var app = express();
function rmdir(dir, callback) {
    // 传要删除的文件夹 不是string
    fs.readdir(dir, (err, files) => {
        // index 是 读取files下标
        function next(index){
            // 如果没有文件或 文件夹 直接将这个文件删掉
            if(index == files.length) return fs.rmdir(dir, callback)
            // console.log(files.length)
            let newPath = path.join(dir, files[index])
            fs.stat(newPath, (err, stat) => {
                if(stat.isDirectory()){
                    // 有文件夹 进这个文件夹
                    rmdir(newPath, () => {
                        next(index + 1)
                    })
                }else {
                    // 删文件
                    fs.unlink(newPath, () => {
                        next(index + 1)
                    })
                }
            });
        }
        next(0)
    })
}
app.use(express.static('www'))
app.get('/getall', (req, res) => {
    fs.readFile('./data.json', (err, data) => {
        var arr = JSON.parse(data.toString()).list
        console.log(arr);
        res.json({ list: arr })
    })
})
app.post('/img', (req, res) => {
    var form = new formidable.IncomingForm();
    // 将图片上传至 临时文件夹 uploads 或者 temp
    form.uploadDir = path.resolve(__dirname, './www/uploads');
    form.keepExtensions = true; // 保留拓展名

    form.parse(req, function (err, fields, files) {
        //将上传后的文件名返回出去
        console.log(files);
        res.send(path.parse(files.file.path).base)
    })
})
app.post('/addstudent', (req, res) => {
    let id = ''
    let str = '12345671475289sdfghjkxlkjhasdfghjkzxvbnwertyuio00plmjh'
    let i = 10;
    while (i) {
        id += str[~~(Math.random() * str.length)]
        i--
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let xingming = fields.from.xingming
        let xingbie = fields.from.xingbie
        let nianling = fields.from.nianling
        let shenfenzheng = fields.from.shenfenzheng
        let xuehao = fields.from.xuehao
        let banji = fields.from.banji
        let xueqi = fields.from.xueqi
        let moban = fields.from.moban
        let imageUrl = fields.from.imageUrl
        fs.readFile('./data.json', (err, data) => {
            var arr = JSON.parse(data.toString()).list
            // 根据id创建文件夹
            fs.mkdirSync(path.resolve(__dirname, './www/img/' + id));
            var obj = {
                id,
                xingming,
                xingbie,
                nianling,
                shenfenzheng,
                xuehao,
                banji,
                xueqi,
                moban,
                imageUrl:'/img/' + id + '/' + imageUrl,
            }
            arr.push(obj)
            fs.renameSync(
                // 读取临时文件
                path.resolve(__dirname, './www/uploads/' + imageUrl),
                // 改路径
                path.resolve(__dirname, './www/img/' + id + '/' + imageUrl)
            )
            fs.writeFileSync('./data.json', JSON.stringify({list: arr}))
            res.json({list: arr})
        })
    })
})
app.post('/del', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let id = fields.id;
        // console.log("id:", id);
        fs.readFile('./data.json', (err, data) => {
            var arr = JSON.parse(data.toString()).list
            // 删数据
            var result = arr.filter(item => item.id != id);
            // 获取要删除的文件夹路径
            var lujing = path.resolve(__dirname, './www/img/' + id)
            fs.writeFile('./data.json', JSON.stringify({list: result}),(err) => {
                res.json({list: result})
            });
            rmdir(lujing, () => {
                console.log('文件删除完毕!!!');
            })
        });
    })
})
app.listen(3000, () => {
    console.log(3000);
})