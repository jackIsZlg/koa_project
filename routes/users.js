const router = require('koa-router')()
const mysql = require('mysql');
const DB = require('../config/db');
const Xlsx = require('../config/dlXlsx');
const nodeExcel = require('excel-export'); 
const fs = require('fs');


const errBack = {
  code: 100,
  data: {},
  msg: ''
}

const succBack = {
  code: 0,
  data: {},
  msg: ''
}

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.cookies.set('name', 'tobi');
  console.log(ctx.query)
  ctx.body = 'this is a users/bar response'
})


// 另外一种方式生成Excel（性能好）
router.get('/exportExcel', async function (ctx, next) {
  var conf ={};
    conf.name = "mysheet";
  	conf.cols = [
      {
        caption:'name',
        type:'string',
      },
      {
        caption:'phone',
        type:'string',
      },
      {
        caption:'prize',
        type:'string'
      },
      {
        caption:'addtime',
        type:'string'				
      }
    ];

    let qry = 'select name, phone, prize, DATE_FORMAT(addtime, "%Y-%m-%d %H:%i:%S") as addtime from awardLog order by addtime desc';
    let _data = await DB.query(qry); //查询数据库 
    let rows = [];
    for (let i in _data) {
      rows[i] = [
        _data[i].name,
        _data[i].phone,
        _data[i].prize,
        _data[i].addtime,
      ]
    };
  	conf.rows = rows;
  	var result = nodeExcel.execute(conf);
    let data = Buffer.from(result, 'binary');
    let name = encodeURI('测试表');
    ctx.set('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    ctx.set("Content-Disposition", "attachment; filename=" + name + ".xlsx");
    console.log("处理数据：", data);
    ctx.body = data;
})


// 生成Excel2 (性能一般) 
router.get('/makeExcel', async function (ctx, next) {
  const _headers = ['name', 'phone', 'prize', 'addtime'];
  let qry = 'select name, phone, prize, DATE_FORMAT(addtime, "%Y-%m-%d %H:%i:%S") as addtime from awardLog order by addtime desc';
  let _data = await DB.query(qry); //查询数据库 
  // //表格数据
  await Xlsx.dlXlsx(_headers, _data);
  //类型
  ctx.type = '.xlsx';
  //请求返回，生成的xlsx文件
  ctx.body = fs.readFileSync('output.xlsx');
    //请求返回后，删除生成的xlsx文件，不删除也行，下次请求回覆盖
    // fs.unlink('output.xlsx');
})



router.post('/allAward', async function (ctx, next) {
  let qry = 'select * from awardLog order by addtime desc limit 0,20';
  let result = await DB.query(qry); //查询数据库 
  succBack.data.list = result
  ctx.body = succBack;
})

router.post('/award', async function (ctx, next) {
  let phone = ctx.request.body.phone;
  let awardId = 4;
  const prizeArray = ['安慰奖', '一等奖', '二等奖', '三等奖', '安慰奖'];
  let qry =  `select * from awardLog where to_days(addtime) = to_days(now()) and phone = ${phone}`;
  // 查询当天的抽奖记录
  let result = await DB.query(qry); //查询数据库 
  if (result.length == 2) {
    errBack.msg = '今日次数已用完';
    ctx.body = errBack;
    return;
  }
  let currTime = Math.ceil(Math.random() * 100);
  // 一等奖概率 5%， 二等奖 20%， 三等奖30%， 安慰奖 45%
  if (currTime >= 0 && currTime <= 1) {
    let qry1 = `select * from awardLog where awardId = 1 and phone = ${phone}`;
    result1 = await DB.query(qry1); //如果一等奖抽过了，就不能再抽一等奖了
    if (result1.length > 0) {
      currTime = Math.ceil(Math.random() * 100) + 10;
    } else {
      succBack.data = {
        awardId: 1
      }
      awardId = 1;
    }
  }
  // 二等奖
  if (currTime > 1 && currTime <= 10) {
    succBack.data = {
      awardId: 2
    }
    awardId = 2;
  }
  // 三等奖
  if (currTime >10 && currTime <= 40) {
    succBack.data = {
      awardId: 3
    }
    awardId = 3;
    // ctx.body = succBack;
  }
  // 安慰奖
  if (currTime > 40) {
    succBack.data = {
      awardId: 4
    }
    awardId = 4;
    // ctx.body = succBack;
  }
  let prize = prizeArray[awardId] + '';
  console.log(prize);
  let insertSql = `INSERT INTO awardLog (name, phone, prize, awardId) VALUES ('抽奖', ${phone}, "${prize}", ${awardId})`;
  await DB.query(insertSql);
  ctx.body = succBack;
  // console.log(ctx.request.body)
  // ctx.body = result;
})



module.exports = router
