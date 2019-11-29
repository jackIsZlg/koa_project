# koa_project
脚手架：*koa-generator*，使用koa编写一些实例

koa最大的便利就是使用 **async**、**await** 让数据库查询变成同步


### 编写接口：
> * koa使用async、await
> * koa连接mysql数据库
> * koa生成excel表格接口
> * koa封装操作数据库接口
> * koa编写中奖接口实例

### 设置接口跨域

******
```javascript
  // 设置koa跨域
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
   });

```

### 查询生成excel代码

******
```javascript

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

```


### 中奖逻辑处理

******
```javascript

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
  ```
