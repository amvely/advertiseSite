const express = require('express')
, http = require('http')
, mysql = require('mysql')
, bodyParser = require('body-parser');

const app = express();
app.use(express.static('public')); 
// static으로 지정해서 해당 폴더를 root path로 설정
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// 요청 객체의 body에 요청 파라미터 넣기

var pool = mysql.createPool({
	connectionLimit: 10,
	host:'127.0.0.1',
	user:'root',
	password:'1234',
	database:'ad',
	debug: false
});

var saveUser = function(name, id, pw, callback){
	console.log('addUser 호출');
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('DB 연결 thread id : '+conn.threadId);

		var data = {name:name, id:id, password:pw};

		var exec = conn.query('insert into user set ?', data, function(err, result){
			conn.release();
			console.log('실행 대상 SQL : '+exec.sql);

			if(err){
				console.log('sql 실행 시 오류');
				console.dir(err);

				callback(err, null);
				return;
			}
			callback(null, result);
		})
	});
}

app.post('/addUser', function(req, res){
	console.log('/addUser');

	var paramName = req.body.name;
	var paramId = req.body.id;
	var paramPw = req.body.password;

	saveUser(paramName, paramId, paramPw, function(err, docs){
		if(err) throw err;
	});
	res.end();
})

app.get('/', function(req, res){
	// page1.html 띄우기
	res.sendFile(__dirname+'/public/page1.html');
})

app.get('/dbconnect',function(req, res){
	console.log('/ 호출');

	DBconnect(function(err, connectStatus){
		if(err){
			console.error(err.stack);
			res.end();
			return;
		}
	});
});

app.listen(8001, function(){
	console.log('Express 서버가 8001번 포트에서 시작됨');
});

