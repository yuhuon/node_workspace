/*
	내장 모듈중 url(자원의 위치!) 모듈을 학습한다.

*/
var url=require("url");


//특정 데이터로부터 의미 있는 데이터를 추출하는 과정을
//가리켜 '파싱'이라 한다!!
//url 객체의 parse 메서드는 지정한 url정보에 대한 해석 후, json 형태의 객체를 반환 해준다
var obj=url.parse("http://news.naver.com/main/read.nhn?mode=LPOD&mid=sec&oid=001&aid=0008548583&isYeonhapFlash=Y");

console.log(obj);


