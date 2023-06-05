const express = require("express");
const MongoClient = require("mongodb").MongoClient;
//데이터베이스의 데이터 입력,출력을 위한 함수명령어 불러들이는 작업
const app = express();
const port = 3000;

//ejs 태그를 사용하기 위한 세팅
app.set("view engine","ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
//css/img/js(정적인 파일)사용하려면 이코드를 작성!
app.use(express.static('public'));

//데이터 베이스 연결작업
let db; //데이터베이스 연결을 위한 변수세팅(변수의 이름은 자유롭게 지어도 됨)

MongoClient.connect("mongodb+srv://cisalive:cisaliveS2@cluster0.cjlsn98.mongodb.net/?retryWrites=true&w=majority",function(err,result){
    //에러가 발생했을경우 메세지 출력(선택사항)
    if(err) { return console.log(err); }

    //위에서 만든 db변수에 최종연결 ()안에는 mongodb atlas 사이트에서 생성한 데이터베이스 이름
    db = result.db("ex5");

    //db연결이 제대로 됬다면 서버실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });

});

app.get("/",(req,res)=>{
    res.send("메인페이지 접속완료");
    //send, render는 통틀어서 단 한번.
});

app.get("/brdlist",(req,res)=>{
    // db에서 도큐먼트를 찾고 데이터들을 가지고와서 listpage로 전달
    db.collection("board").find().toArray((err, result)=>{
        res.render("board_list.ejs", {data:result});
    })
    // db.collection("board").find().toArray((err, result)=>{데이터 꺼내온 후 다음에 실행할 코드(보통 ejs에 전달해주는 기능)})
    //    res.render("전달할 파일명", {작명:DB 내 데이터들})
    // })
});

app.get("/brdinsert", (req, res)=>{
    res.render("board_insert.ejs");
})

app.post("/dbinsert", (req, res)=>{
    //게시글 입력 페이지에서 입력한 데이터들을 DB에 저장하는 작업
    //입력 작업이 끝난 후 응답해야 함 -> 게시글 목록으로 이동하거나(오늘은 이거) / 글작성완료 상세페이지로 이동함
    //count collection에서 boardcount수치값을 가지고 온 후
    //board collection애 데이터값이 삽입되는 순간 순번값으로 boardCount의 값을 받아서 사용해야 함
    db.collection("count").findOne({name:"게시물갯수"},(err, result)=>{
        //count에서 순번값을 가져와서
        db.collection("board").insertOne({
            num:result.boardCount, //result안의 boardCount에 접근
            title:req.body.title,
            author:req.body.author
        },(err, result)=>{
            db.collection("count").updateOne({name:"게시물갯수"},{$inc:{boardCount:1}},(err, result)=>{
                res.redirect("/brdlist") //게시글 입력 완료 후 게시글 목록 페이지로 요청
            })
            // increment:{증가시킬key:n} <- n씩 증가

        })
    })  

})

app.get("/brdupdate/:num",(req, res)=>{
    // DB에 저장돼있는 게시글 번호와 제목, 작성자를 가져와야 함
    // 해당 수정 페이지로 전달해주면서 input태그 value 값으로 표시해서 보여줘야 함
    // 해당 게시글 페이지에 있는 제목, 번호, 작성자만 가져와야 함
    // url 주소창에 적어서 보내주는 데이터들은 전부 string이라서, 변환 작업 필요
    db.collection("board").findOne({num:Number(req.params.num)}, (err, result)=>{
        // req.params.num에 맞는 데이터를 가져오기
        res.render("board_update.ejs", {data:result})
    })
})
// 데이터베이스 update 처리
app.post("/dbupdate", (req, res)=>{
    // console.log(req.body) <- 데이터베이스에서 찾아왔던 입력값이 나옴
    db.collection("board").updateOne({num:Number(req.body.num)},{$set:{
        title:req.body.title,
        author:req.body.author
    }},(err, result)=>{
        res.redirect("/brdlist") //데이터베이스 데이터 수정 후 게시글 목록으로 요청
    })
})

// 데이터베이스 삭제 처리
// form 태그 O -> get:query / post:body
// form 태그 X -> params
app.get("/dbdelete/:num", (req,res)=>{
    db.collection("board").deleteOne({num:Number(req.params.num)},(err, result)=>{
        res.redirect("/brdlist") //데이터베이스 데이터 삭제 후 게시글 목록으로 요청
    })
})

// update 기능연습
/* app.get("/test", (req, res)=>{
    // 데이터베이스 수정 명령어
    // 해당 컬렉션count에 name, boardCount든 수정할 항목을 아무거나 지정해도
    // 수정되는 범위는 객체 단위로 취급할 수 있다
    // increment decrement...
    db.collection("count").updateOne({name:"얍"},{$set:{name:"게시물갯수", boardCount:1}},(err, result)=>{
        console.log("데이터 수정 완료");
    })
    // db.collection("count").updateOne({key:"값"}},{$set:{바꿀key:값, ...}},(err, result)=>{
    //     실행할 함수
    // })
})
*/
