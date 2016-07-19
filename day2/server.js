/*
http 내장 모듈로만은 완전한 웹 서버를 구축 하기엔 너무나 부족하다
따라서 express 모듈을 사용해보자!!
express 모듈이란? 웹서버 구축에 필요한 기능들을 위해 http 모듈에
추가 시켜 놓은 외부모듈을 말한다.(http의 업그레이드 모듈 but 2 모듈은 같이 사용해야한다.)

ejs모듈을 이용하면, html 문서내에서 반복문 등의 
기초적인 자바스크립트 프로그래밍 문법이 적용될 수 있다.


*/

var http=require("http");//내부 모듈
var express=require("express");//외부 모듈
var fs=require("fs");//내부모듈
var mysql=require("mysql");//외부 모듈
var bodyParser= require("body-parser");//외부 모듈
var ejs=require("ejs");//외부 모듈


//express 모듈로 부터 application 객체를 생성하자!!
var app=express();


app.use(bodyParser.json()); // json지원
app.use(bodyParser.urlencoded({ extended: true }));// form 태그로 전성될 경우
																		 //이 속성을 지정해야 함...


//mysql 서버에 접속!!
var client=mysql.createConnection({
	"url" : "localhost",
	"user":"root",
	"password":""
});//접속
client.query("use iot");// 사용할 db선택!!

//게시물 목록 보기 요청 처리
app.route("/list").get(function(request,response){

	//list.html 페이지를 읽어들인 결과를 page 변수에 담음..
	var page=fs.readFileSync("./list.html","utf8");

	//응답전에 이미 데이터베이스에서 레코드들을 가져왔어야 한다..

	client.query("select * from student", function(error,records){
		if(!error){
			//console.log(records);
			response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
			response.end(ejs.render(page, {dataList:records}));// 클라이언트에게 응답하는 시점
			//page를 렌더링 하면서,2번째 인수로 전달한 객체를 렌더링
			//대상이 되는 html에 전달해준다(자동으로...)
		}else{	
			console.log("망했어요 ㅜㅅ ㅜ")
		}
		
	});


});

//application 객체란? 웹서버 역활을 담당할 객체!!
//웹서버 역활이란? 요청에 대하여 응답을 처리하는 역활을 말함.
/*
app.use(function(request,response){
	response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
	response.end("express 모듈로 구축한 서버의 응답 메세지");
});
*/

//라우팅 미들웨어를 사용해본다 : route란 방향을 잡는 것을 말하고,
//Nodejs에서는 원하는 페이지를 나오게 처리해준다....
//app.use(app.router);//라우팅시 함수 () 표시x

//클라이언트가 get방식으로 요청을 시도하면 동작하게 될 메서드!!
//등록폼을 원하면....http://localhost:8383/regist_form
app.route("/regist_form").get(function(request,response){
	//console.log("노란 페이지를 원합니까?");

	var data=fs.readFileSync("./regist_form.html", "utf8");
	response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
	response.end(data);
});

//클라이언트가 등록을 원하면...post방식으로 요청할 경우
//서버에서는 post () 메서드로 받아야 한다.!!!
app.route("/regist").post(function(request,response){
	//클라이언트가 보낸 데이터를 받고!!
	//express 모듈 사용시 request가 업그레이드가
	//되었기 때문에 param() 메서를 사용 할 수 있다.!!

	//console.log(request.body);
	var data=request.body;

	var id=data.id;
	var pwd=data.pwd;
	var name=data.name;
	
	//console.log("넘겨 받은 id는 "+id);
	//console.log("넘겨 받은 pwd는 "+pwd);
	//console.log("넘겨 받은 name은 "+name);
	
//받은 데이터를 데이터베이스에 넣는다!!!!
	//쿼리문 수행후 두번째 인수인 익명함수가 작동한다..개발자는 여기서
	//등록 성공 or 실패 여부를 확인 할 수 있다.
	client.query("insert into student(id,pwd,name) values('"+id+"','"+pwd+"','"+name+"')",function(error,records,field){
		if(error){
			console.log("등록 실패입니다.");
		}else{
			console.log("등록 성공입니다.");

			//리스트 페이지에 대한 요청!!
			//클라이언트의 브라우저로 하여금, 지정한 url로 요청을 다시 시도 하라는 명령
			response.redirect("/list");
		}
	});
});

//상세보기 요청이 들어오면...
app.route("/detail/:id").get(function(request,response){
	var page1=fs.readFileSync("./detail.html","utf8");

	//데이터베이스 연동되어 있어야 한다.!!
	//유저가 선책한 아이디를 get 방식으로 넘겨 받았어야 한다.
	//console.log("유저가 서버로 전송한"+request.params.id);
	
	client.query("select * from student where id='"+request.params.id+"'",function(error,records){
		if(!error){
			console.log(records);
			response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
			response.end(ejs.render(page1, {obj:records}));
		}else{
			console.log("일치하는 데이터를 발견할 수 없네요");
		}
	});
});

//삭제 요청 처리

app.route("/delete/:id").get(function(request,response){
	var id=request.params.id
	client.query("delete from student where id='"+id+"'",function(error,records){
		if(!error){
			response.redirect("/list");
		}else{
			console.log("삭제에 실패 했습니다.");
		}
	});
});



//app.use()메서드 안에는 미들웨어라고 불리는 각종 express의 지원 함수들이 
//자리잡을수 있따.

//서버구동시작
var server=http.createServer(app);
server.listen(8383,function(){
	console.log("Server is runing at 8383");
});