//search button
var search = document.getElementById("searchButton");
//menu tabs
var acts = document.querySelectorAll("#menu li");
var infoBox = document.getElementById("infoBox");
//clear button
let clear = document.getElementById("clearButton");

// let server = "http://127.0.0.1:5000/"
let server = "http://timzhangrepo-python.us-east-1.elasticbeanstalk.com/"
var date = new Date();
var time = date.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})
//Author tim zhang
clear.onclick = function () {
    document.getElementById("stockSymbolInput").value = "";
    document.getElementById("notFoundBox").style.display = "none"
    infoBox.style.display = "none";
}
search.onclick = function () {
    document.getElementById("notFoundBox").style.display = "none"
    var input = document.getElementById("stockSymbolInput").value; //the user input value is recorded
    userinput = input;
    if (input != null && input != "") {
        xhttp_main(input);
    } else {
        document.getElementById("stockSymbolInput").required = true;
    }
}
var content = document.querySelectorAll("#content li");
for (var i = 0; i < acts.length; i++) {
    acts[i].index = i;
    //when user click a tap on the menu
    acts[i].onclick = function () {
        //set all content, and menu tap display to none
        for (var i = 0; i < content.length; i++) {
            content[i].style.display = "none";
            if (acts[i] == undefined) {
                continue;
            }
            acts[i].removeAttribute("class");
        }
        //set current content display to block
        content[this.index].style.display = "block";
        //highlight
        this.className = "act";
    }
}
//Ajax part
function xhttp_main(input) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", server + "response/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            if (obj.detail == "Not found.") {
                infoBox.style.display = "none";
                document.getElementById("notFoundBox").style.display = "block";
            } else {
                document.getElementById("CO_name_field").innerText = obj.name;
                document.getElementById("CO_ticker_field").innerText = obj.ticker;
                document.getElementById("CO_EC_field").innerText = obj.exchangeCode;
                document.getElementById("CO_SD_field").innerText = obj.startDate;
                document.getElementById("CO_description").innerText = text_truncate(obj.description);
                infoBox.style.display = "block";
                xhttp_SS(input); //make stcok summary request request.
                xhttp_news(input);
                xhttp_chart(input);//call get the chart
            }
        }
    };
}
function xhttp_SS(input) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", server + "stock/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            if (obj.detail == "Not found.") {
                infoBox.style.display = "none";
                document.getElementById("notFoundBox").style.display = "block";
            } else {
                var info = document.getElementsByClassName("SStr");
                var keyArray = ["ticker", "timestamp", "prevClose", "open", "high", "low", "last", "", "", "volume"]
                for (var i = 0; i < info.length; i++) {
                    if (i == 7) {
                        info[7].innerHTML = ""; //clean previous results
                        var change = (parseFloat(obj[0].last) - parseFloat(obj[0].prevClose)).toFixed(2);
                        var changeDisplay = document.createElement("span");
                        info[7].appendChild(changeDisplay);
                        changeDisplay.innerText = change;
                        insertArrow(info[i], change);
                    } else if (i == 1) {
                        info[i].innerText = obj[0][keyArray[1]].split("T")[0];
                    } else if (i == 8) {
                        var change = parseFloat(obj[0].last) - parseFloat(obj[0].prevClose);
                        var changePercent = ((change / parseFloat(obj[0].prevClose)) * 100).toFixed(2) + "%";
                        info[i].innerText = changePercent;
                        insertArrow(info[i], change);
                    } else {
                        info[i].innerText = obj[0][keyArray[i]];
                    }
                }
                infoBox.style.display = "block";
            }
        }
    };
}
function xhttp_news(input) {
    var board = document.getElementById("newsBoard");
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", server + "news/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            board.innerHTML = "";
            let numOfArticles = (5 < obj.articles.length) ? 5 : obj.articles.length;
            for (var i = 0; i < numOfArticles; i++) {
                append(obj.articles[i]);
            }
        }
    };
    function append(article) {
        let div = document.createElement("div");
        div.className = "newsBox";
        let imgBox = document.createElement("div");
        imgBox.className = "articleImgBox";
        var image = document.createElement("img");
        if (article.urlToImage != null && article.urlToImage != "" && article.urlToImage != undefined) {
            image.src = article.urlToImage;
            image.width = "80";
            image.className = "center";
            imgBox.appendChild(image);
        }
        let textBox = document.createElement("div");
        let title = document.createElement("p");
        title.innerText = article.title;
        title.style = "font-weight: bold";
        let p2 = document.createElement("p");
        let time = article.publishedAt.split("T")[0];
        p2.innerText = time;
        let p3 = document.createElement("a");
        p3.href = article.url;
        p3.innerText = "See Original Post";
        textBox.className = "articleTxtBox";
        textBox.appendChild(title);
        textBox.appendChild(p2);
        textBox.appendChild(p3);
        div.appendChild(imgBox);
        div.appendChild(textBox);
        board.appendChild(div);
    }
}
function xhttp_chart(input) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", server + "charts/" + input, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.response);
            getChart(input.toUpperCase(), obj);
        }
    };
}
function getChart(ticker, data) {
    var closePriceByDate = [];
    var volumeByDate = [];
    for (var i = 0; i < data.length; i++) {
        var d = data[i].date;
        var date = Date.UTC(d.substring(0, 4), d.substring(5, 7) - 1, d.substring(8, 10));
        var point = [date, data[i].close];
        closePriceByDate.push(point);
        var point2 = [date, data[i].volume]
        volumeByDate.push(point2);
    }
    var seriesOptions = [];
    seriesOptions[0] = {
        name: ticker,
        type: 'area',
        data: closePriceByDate,
        gapSize: 5,
        tooltip: {
            valueDecimals: 2
        },
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
        },
        threshold: null
    };
    seriesOptions[1] = {
        name: ticker + ' Volume',
        data: volumeByDate,
        type: 'column',
        name: 'Volume',
        pointWidth: 2,
        yAxis: 1
    };
    names = [ticker, ticker + ' Volume'];

    Highcharts.stockChart('container', {

        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d'
            }, {
                type: 'day',
                count: 15,
                text: '15d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            },{
                type:'month',
                count:3,
                text:'3m'
            },{
                type:'month',
                count:6,
                text:'6m'
            }
            ],
            inputEnabled: false,
            selected: 4
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [{
                    }]
                }
            }
        },
        plotOptions: {
            column: {
                pointPlacement: 'on'
            }
        },
        title: {
            text: 'Stock Price ' + ticker + ' ' + time.split(",")[0],
        },
        subtitle: {
            text: '<a href="https://api.tiingo.com" style="text-decoration: underline; color: blue">Source:Tiingo</a>'
        },
        xAxis: {
            type: "datatime",
            title: {
                text: 'Weeks'
            },
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%b%e/%Y', this.value);
                }
            }
        },
        yAxis: [
            {
                opposite: false,
                min : 0,
                tickAmount: 4,
                title: {
                    text: 'Stock Price'
                }
            },
            {
                opposite: true,
                tickAmount: 4,
                title: {
                    text: 'Volume'
                },
            }
        ],
        series: seriesOptions
    })
}
function text_truncate(str) {
    if (str == null) {
        return "undefined"
    }
    var ending = '...';
    if (str.length > 330) {
        return str.substring(0, 330 - ending.length) + ending;
    } else {
        return str;
    }
};
function insertArrow(obj, change) {
    if (change >= 0) {
        let up = document.createElement("img");
        up.src = "https://csci571.com/hw/hw6/images/GreenArrowUp.jpg";
        up.style = "width:15px; margin-left: 5px;";
        obj.appendChild(up);
    } else {
        let down = document.createElement("img");
        down.src = "https://csci571.com/hw/hw6/images/RedArrowDown.jpg";
        down.style = "width:15px; margin-left: 5px;";
        obj.appendChild(down);
    }
}