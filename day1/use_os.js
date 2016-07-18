/*
	내장 모듈 중 os모듈을 사용해 보자.	
*/
var os=require("os");
//cpu 정보
//console.log(os.cpus());

//메모리 정보
//console.log(os.freemem()/1024/1024+"bytes");

//플랫폼
console.log(os.platform());