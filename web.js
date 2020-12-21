const express = require('express')
, http = require('http')
, mysql = require('mysql')
, bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname+'/public')); 
// static으로 지정해서 해당 폴더를 root path로 설정
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
// 뷰엔진 ejs로 설정
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// 요청 객체의 body에 요청 파라미터 넣기

var pool = mysql.createPool({
	host:'10.0.0.1',
	user:'louren205c',
	password:'louren205',
	database:'louren205c',
	port:'3306'
});
/*
var pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password:'1234',
	database:'ad',
	port:'3306',
	debug: false
});
*/

pool.getConnection(function(err, conn){
	if(err) throw err;
	console.log('DB 연결 thread id : '+conn.threadId);

	var exec = conn.query('show tables like \'user\'', function(err, result){
		if(err) throw err;

		if(result.length==0){
			// table이 없으면
			var exec = conn.query('create table user (page char(20) not null, name char(20) not null, number char(13) not null, home text, question text, checkbox char(10) not null)', function(err, result){
				conn.release();
				if(err) throw err;
			})
		}else{
			// table이 있으면
			conn.release();
		}
	});
});

var saveUser = function(page, name, number, home, question, allow, callback){
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

		var data = {page: page, name:name, number:number, home:home, question:question, checkbox: allow};

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

var popUser = function(callback){
	console.log('popUser 호출');
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('DB 연결 thread id : '+conn.threadId);
		var exec = conn.query('select * from user', function(err, result){
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

var deleteUser = function(callback){
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('DB 연결 thread id : '+conn.threadId);
		var exec = conn.query('delete from user', function(err, result){
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

app.post('/addUser/:page', function(req, res){
	console.log('/addUser');

	var paramPage = req.params.page;
	var paramName = req.body.name;
	var paramNumber = req.body.number1 + req.body.number2 + req.body.number3;
	var paramHome = req.body.home;
	var paramQuestion = req.body.question;
	var paramAllow = req.body.allow===undefined?"disallow":req.body.allow;

	saveUser(paramPage, paramName, paramNumber, paramHome, paramQuestion, paramAllow, function(err, result){
		if(err) throw err;
	});
	res.redirect('/'+paramPage);
	res.end();
})

app.get('/deleteUser', function(req, res){
	// user 전체 없애기
	deleteUser(function(err, result){
		if(err) throw err;
	})
	res.redirect('/lourenadminsecret');
	res.end();
})


app.get('/lourenadminsecret', function(req, res){
	// admin page 띄우기
	popUser(function(err, result){
		if(err) throw err;
		var context = {result:[]};

		result.map((user)=>{
			context.result.push({
				"page":user.page,
				"name":user.name,
				"number":user.number,
				"home":user.home,
				"question":user.question,
				"checkbox":user.checkbox
			});
		});

		req.app.render('admin', context, function(err, html){
			if(err){
				console.error('뷰 렌더링 중 오류 : '+err.stack);
				return;
			}
			res.end(html);
		})
	});
})

// 이곳에 js 추가하시면 됩니다.
// 이미 만들어둔 app.get 부분 복사 후,
// '/page1' 부분을 만들어둔 html 페이지 이름으로 변경
// 아래의 '/public/page1.html' 부분도 변경

app.get('/page1', function(req, res){
	// page1.html 띄우기
	req.app.render('page1', function(err, html){
		if(err){
			console.error('뷰 렌더링 중 오류 : '+err.stack);
			return;
		}
		res.end(html);
	})
})

app.get('/page2', function(req, res){
	// page2.html 띄우기
	req.app.render('page2', function(err, html){
		if(err){
			console.error('뷰 렌더링 중 오류 : '+err.stack);
			return;
		}
		res.end(html);
	})
})





//////////////////////////////////////////


app.listen(8001, function(){
	console.log('Express 서버가 8001번 포트에서 시작됨');
});

