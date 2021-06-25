var express = require('express');
var router = express.Router();
const models = require('../db');
const mysql = require('mysql');

/* GET users listing. */
const axios = require('axios');
const itemRegex = /<item>(.+?)<\/item>/gs;
const linkRegex = /(?:<link>)(.+?)(?:<\/link>)/;
const titleRegex = /(?:<title>)(.+?)(?:<\/title>)/;
const cdataRegex = /(?:<\W{2}CDATA\W)(.+?)(?:]]>)/;

function unionArray(title,link){
    let res = [];
    for(let i = 0 ; i < title.length ; i++){
        res.push({title: title[i], link: link[i]});
    }
    return res;
}

const conn = mysql.createConnection(models.mysql);
conn.connect();

/*
 * If the target of request is /some/thing, it's calls RSS of RSSHUB, or it calls third part RSS feed.
 */

router.get('/',(req,response,next) => {
    let target = req.query.target;
    let url = "";
    if(target[0] == 'h'){
        url = target;
    }else{
        url = "http://localhost:1200" + target
    }
    axios.get(url)
        .then(res => {
            let html = res.data;
            let items = html.match(itemRegex);
            let titles = items.map(x => x.match(titleRegex)[1])
            let links = items.map(x => x.match(linkRegex)[1])
            if(titles[0].includes("CDATA")){
                titles = titles.map(x => x.match(cdataRegex))
                    .map((x) => {
                        if(x != null){
                            return x[1]
                        }
                    })
            }
            response.send(unionArray(titles,links));
        }).catch(err => {
            throw err;
        })
});

function rowsToCard(rows){
    return rows.map(row => {
        let pos = row.size.match(/\d+/g);
        let textStyle = "grid-column : "+ pos[0] +" / "+ pos[1] +"; grid-row : "+ pos[2] +" / " + pos[3];
        return {title: row.title,
                style: textStyle,
                add: false,
                data:[],
                target: row.target,
                setting: false};
    })
} 
router.get('/getall',(req,res,next) => {
    conn.query("SELECT * FROM records",function(err,rows,fields){
        if(err){
            throw err;
        }
        let data = [];
        rows.forEach(x => data.push(x));
        res.send(rowsToCard(data));
    });
})
router.get('/add',(req,res,next) => {
    conn.query("INSERT INTO records VALUES(\"" + req.query.title + "\",\"" + req.query.style  + "\",\"" + req.query.target + "\");",function(err){
        if(err){
            throw err;
        }
        res.send("Add success");
    });
})
router.get('/delete',(req,res,next) => {
    conn.query("DELETE FROM records WHERE title=\"" + req.query.title + "\";",function(err){
        if(err){
            throw err;
        }
        res.send("Delete success");
    })
})
router.get('/update',(req,res,next) => {
    let size = req.query.style.match(/\d+/g);
    let titles = req.query.title.split("__old__");
    let newTitle = titles.shift();
    let oldTitle = titles.pop();
    oldTitle = (oldTitle)?(oldTitle):(newTitle);
    let command = "UPDATE records SET title='" + newTitle + "',size='" + size + "',target='" + req.query.target + "' WHERE title='" + oldTitle + "';";
    conn.query(command,function(err,rows,fields){
        if(err){
            throw err;
        }
        res.send("Updated");
    })
})
module.exports = router;
