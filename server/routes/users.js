var express = require('express');
var router = express.Router();
const models = require('../db');
const mysql = require('mysql');

/* GET users listing. */
const http = require('http');
const https = require('https');
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

router.get('/',(req,res,next) => {
    let target = req.query.target;
    let url = "";
    if(target[0] == 'h'){
        url = target;
    }else{
        url = "http://localhost:1200" + target
    }
    let client = http;
    client = (url.includes("https")) ? https:client;
    client.get(url,function(resinner){
        let html = '';
        console.log(url)
        resinner.on('data',function(chunk){
            html += chunk;
        })
        resinner.on('end',function(){
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
            res.send(unionArray(titles,links));
        })
    })
});

module.exports = router;
