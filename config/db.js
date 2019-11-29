var mysql = require('mysql');
 
//建立连接的方法 
function __connection(){
    var connection = mysql.createConnection({
        host     : '122.51.66.155',
        port     : 3306, // 数据库连接的端口号 默认是3306
        user     : 'root',
        password : 'zhouligangwcl',
        database : 'zlgDb'
    });
    connection.connect();
    return connection;
}
 
exports.query = function(sql,parmas=null){
    //1.获取数据库连接对象
    var connection = __connection();
    return new Promise(function(resolve, reject){   
        //2执行sql语句
        connection.query(sql, parmas, function (error, results, fields) {
            if (error) {
                reject(results)
                throw error;
            };
            // console.log(results);
            resolve(results);
        });
        //3关闭连接
        connection.end();
    })
}
