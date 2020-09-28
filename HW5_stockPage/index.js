//search button
var search = document.getElementById("searchButton");
//menu tabs
var acts = document.querySelectorAll("#menu li");
var infoBox = document.getElementById("infoBox");
//clear button
let clear = document.getElementById("clearButton");
let aws = "http://timzhangrepo-python.us-east-1.elasticbeanstalk.com/"

//Author tim zhang
clear.onclick = function () {
    document.getElementById("stockSymbolInput").value = "";
    document.getElementById("notFoundBox").style.display="none"
    infoBox.style.display = "none";
}
search.onclick = function () {
    document.getElementById("notFoundBox").style.display="none"
    var input = document.getElementById("stockSymbolInput").value; //the user input value is recorded
    userinput = input;
    if (input != null && input != "") {
        xhttp_main(input);
    }else{
        document.getElementById("stockSymbolInput").required=true;
    }
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
function xhttp_main(input){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", aws+"response/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            if(obj.detail=="Not found."){
                infoBox.style.display = "none";
                document.getElementById("notFoundBox").style.display="block";
            }else{
                document.getElementById("CO_name_field").innerText=obj.name;
                document.getElementById("CO_ticker_field").innerText=obj.ticker;
                document.getElementById("CO_EC_field").innerText=obj.exchangeCode;
                document.getElementById("CO_SD_field").innerText=obj.startDate;
                document.getElementById("CO_description").innerText=text_truncate(obj.description);
                infoBox.style.display = "block";
                xhttp_SS(input); //make stcok summary request request.
            }
        }
    };
}
function xhttp_SS(input){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", aws+"stock/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            if(obj.detail=="Not found."){
                infoBox.style.display = "none";
                document.getElementById("notFoundBox").style.display="block";
            }else{
                var info = document.getElementsByClassName("SStr");
                var keyArray = ["ticker","timestamp","prevClose","open","high","low","last","","","volume"]
                for(var i=0; i<info.length;i++){
                    if(i==7){
                        info[7].innerHTML=""; //clean previous results
                        var change = (parseFloat(obj[0].last)-parseFloat(obj[0].open)).toFixed(2);
                        var changeDisplay = document.createElement("span");
                        info[7].appendChild(changeDisplay);
                        changeDisplay.innerText=change;
                        insertArrow(info[i],change);
                    }
                    else if(i==1){
                        info[i].innerText = obj[0][keyArray[1]].split("T")[0];
                    }
                    else if(i==8){
                        var change = parseFloat(obj[0].last)-parseFloat(obj[0].open);
                        var changePercent = (change/parseFloat(obj[0].open)).toFixed(2)+"%";
                        info[i].innerText = changePercent;
                        insertArrow(info[i],change);
                    }
                    else{
                        info[i].innerText = obj[0][keyArray[i]];
                    }
                }
                infoBox.style.display = "block";
            }
        }
    };
}

function text_truncate(str) {
    if(str==null){
        return "undefined"
    }
    var ending='...';
    if (str.length > 330) {
        return str.substring(0, 330 - ending.length) + ending;
    } else {
        return str;
    }
};
function insertArrow(obj, change){
    if(change>=0){
        let up = document.createElement("img");
        up.src="https://csci571.com/hw/hw6/images/GreenArrowUp.jpg";
        up.style="width:15px; margin-left: 5px;";
        obj.appendChild(up);
    }else{
        let down = document.createElement("img");
        down.src="https://csci571.com/hw/hw6/images/RedArrowDown.jpg";
        down.style="width:15px; margin-left: 5px;";
        obj.appendChild(down);
    }
}

