/*
	외부의 필요한 모듈을 사용하기 위해서는 require함수 안에
	필요한 모듈명을 명시하면 된다.
*/

var mm=require("./mymodule");

function A_random(){

	var r=mm.getRandom(5);

	console.log("5에 대한 랜덤값은"+r)

	setTimeout(function(){
		A_random();
		},500)
};

A_random();

var l=mm.getExtend("test.png");
console.log("test.png의 확장자는"+l)