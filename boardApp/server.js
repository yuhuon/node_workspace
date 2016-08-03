/*--------------------------------------------------------------------------
Nodejs기반 서버 구축!!

필요한 모듈!!!(객체,각종 함수 등이 모여 있는 라이브러리를 의미)

웹서버 구축에 필요한 모듈!
http(필수)- 요청,응답을 처리하는 모듈
express(http의 보완 모듈)  외부
fs-html문서를 보여주기 위한 파일 제어 모듈
router-요청 url을 분석하여 알맞는 처리를 담당 및 요청,응답에 필요한
		 부가적 기능을 보유한 모듈  외부
mysql- mysql데이터 베이스 핸들링 모듈...  외부
body-parser - post방식으로 데이터를 전송해 올때, 그 데이터를
					분석 해주는 모듈  외부
ejs - html 코드내에 동적 프로그래밍 코드를 삽입할 수 있는 모듈  외부 
----------------------------------------------------------------------------*/
var http=require("http");  //모듈 불러오기!!!
var express=require("express");
var fs=require("fs");
var mysql=require("mysql");
var bodyParser=require("body-parser");
var ejs=require("ejs");


var app=express();//express 모듈 얻기!!

/*-----------------------------------------------------------------------------
mysql서버 접속 : 접속후 반환되는 client 객체를 이용하여
						쿼리문을 수행할 수 있다.
-------------------------------------------------------------------------------*/
var client=mysql.createConnection({
	url: "localhost",
	user: "root",
	password: ""
});
client.query("use iot");//데이터 베이스 선택

/*-----------------------------------------------------------------------------
정적 자원(이미지,css,js,html,음원 등)자원을 접근하기 위한 경로 설정
express 모듈에 삽입할 수 있는 부가적 함수들을 가리켜 미들웨어라 한다.

-------------------------------------------------------------------------------*/
//app.use(express.static(경로));
app.use(express.static(__dirname));//server.js가 있는 폴더를 경로로 삼기!!
app.use(bodyParser.json());//제이슨 형태로 데이터를 처리하겠다는 미들웨어 
app.use(bodyParser.urlencoded({extended:true}));//form 데이터를 받아들이겠다는
//미들웨어..



/*-----------------------------------------------------------------------------
요청 url에 따른 알맞는 처리 ( router 모듈 이용)
/board/writeForm :글쓰기 폼 요청이 들어오면 내부 함수가 처리 하겠다.!!
-------------------------------------------------------------------------------*/
var writeResult=""; //글 작성후 보게될 url


app.route("/board/writeForm").get(function(request,response){
	//지정한 파일 읽어들여서 변수로 담아두자!!
	//fs.readFileSync("파일명","utf8");
	var content=fs.readFileSync("./board/write.html","utf8");
	response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
	response.end(content);
});


/*-----------------------------------------------------------------------------
/board/write요청을 처리
-------------------------------------------------------------------------------*/


app.route("/board/write").post(function(request,response){


	//폼양식으로 부터 전송되어온 입력 양식 파라미터들을 받아서
	//mysql에 입력한다.
	console.log(request.body);

	var sql="insert into board(writer,title,content)";
	sql=sql+" values('"+request.body.writer+"','"+request.body.title+"','"+request.body.content+"')";//values 앞에 한칸 띄우기
	//console.log(sql);

	client.query(sql,function(error, data, fields){//문자열로 쿼리문 대입
		if(!error){
			console.log("입력성공");	
			//var content=fs.readFileSync("./board/list.html","utf8");	
			//response.end(content);
			
			//응답을 받는 클라이언트의 브라우저는 지정한 url로 다시 접속하라는 명령
			response.redirect("/board/list/page");
		}else{
			console.log("입력실패");
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			var content=fs.readFileSync("./board/error.html","utf8");	
			response.end(content);
		}
	});	
});

/*-----------------------------------------------------------------------------
/bord/list요청을 처리
-------------------------------------------------------------------------------*/
app.route("/board/list/:page").get(function(request,response){
	response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
	
	var pageSize=3;
	var page= request.params.page;
	var num=(page-1)*pageSize;
	
	
	//db를 조회 하여 레코드를 가져와서, list.html에 전달!!
	//데이터 전달을 위해서는 ejs모듈이 사용된다.
	client.query("select * from board order by board_id desc limit "+num+","+pageSize,function(error,records){
		//console.log(records);
		var content=fs.readFileSync("./board/list.html","utf8");	
		//서버에서 ejs 문법을 먼저 실행시켜야 한다!!
		//즉 <%%>영역이 수행 되게 하기 위해
		response.end(ejs.render(content, {dataList:records}));
	});	
});


/*-----------------------------------------------------------------------------
/board/detail 상세보기 요청 처리
select * from board where board_id=유저가 선택한 board_id
-------------------------------------------------*/
app.route("/board/detail/:board_id").get(function(request,response){
	//--->board/detail/23 방식으로 전송해줌 레스트풀 전송 방식

	var sql="select * from board where board_id ="+request.params.board_id;
	client.query(sql,function(error,record){
		//console.log(record);
		//한건의 게시물을 상세보기 페이지에 출력해 보자!!
		var page=fs.readFileSync("./board/detail.html","utf8");
		response.writeHead(200,{"Content-Type": "text/html;charset=utf-8"});
		response.end(ejs.render(page,{data:record}));
	});

});
/*-----------------------------------------------------------------------------
/board/delete 글 한건 삭제 요청 처리
delete from board where board_id=유저가 선택한 board_id
-------------------------------------------------------------------------------*/
app.route("/board/delete/:board_id").get(function(request,response){
	var board_id=request.params.board_id;
	
	var sql="delete from board where board_id="+board_id;
	console.log(sql);
	//쿼리 수행후 계시물 목록을 보여줘야 한다.
	client.query(sql,function(error,record){
		
		response.redirect("/board/list/:page");
	});
});

/*-----------------------------------------------------------------------------
/board/edit 게시물 글 한건 수정 요청
-------------------------------------------------------------------------------*/
app.route("/board/edit").post(function(request,response){
	var postData=	request.body;//post 방식으로넘겨받은 데이터
	var writer=postData.writer;//넘겨받은 작성자
	var title=postData.title;//넘겨받은 제목
	var content=postData.content;//넘겨받은 내용
	var board_id=postData.board_id//넘겨받은 게시물 id

	var sql="update board set writer='"+writer+"' , title='"+title+"' , content='"+content+"' ";
		sqp=sql+" where board_id="+board_id;
	//console.log(sql);
	client.query(sql,function(error,data){
		//상세보기로 재 접속을 명령 
	response.redirect("/board/detail/"+board_id);	
	})

});

/*-----------------------------------------------------------------------------
9999 포트에서 버 가동!!
-------------------------------------------------------------------------------*/
var server=http.createServer(app);
server.listen(9999,function(){
	console.log("Sever is running at 9999...");
});