//search button
var search = document.getElementById("searchButton");
//menu tabs
var acts = document.querySelectorAll("#menu li");
var infoBox = document.getElementById("infoBox");
//clear button
let clear = document.getElementById("clearButton");



clear.onclick = function () {
    document.getElementById("stockSymbolInput").value = "";
    infoBox.style.display = "none";
}
search.onclick = function () {
    var input = document.getElementById("stockSymbolInput").value; //the user input value is recorded
    userinput = input;
    if (input != null && input != "") {
        infoBox.style.display = "block";
        xhttp(input);
    }else{
        document.getElementById("stockSymbolInput").required=true;
    }
    console.log(input);
}

var content = document.querySelectorAll("#content li");
for(var i=0;i<acts.length;i++){
    acts[i].index = i;
    //when user click a tap on the menu
    acts[i].onclick=function (){
        //set all content, and menu tap display to none
        for(var i=0; i<content.length;i++){
            content[i].style.display="none";
            acts[i].removeAttribute("class");
        }
        //set current content display to block
        content[this.index].style.display="block";
        //highlight
        this.className="act";
    }
}
//Ajax part
function xhttp(input){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://127.0.0.1:5000/response/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            document.getElementById("CO_name_field").innerText=obj.name;
            document.getElementById("CO_ticker_field").innerText=obj.ticker;
            document.getElementById("CO_EC_field").innerText=obj.exchangeCode;
            document.getElementById("CO_SD_field").innerText=obj.startDate;
            document.getElementById("CO_description").innerText=text_truncate(obj.description);

        }
    };
}

function text_truncate(str) {
    ending='...';
    if (str.length > 350) {
        return str.substring(0, 350 - ending.length) + ending;
    } else {
        return str;
    }
};

