const video = document.getElementById("player");
const canvas = document.getElementById("photo");
const ctx = canvas.getContext("2d");
const strip = document.getElementById("strip");

ctx.font = "11px monospace";

ctx.fillStyle = "#00BB00";
var fontSize = 11;
var symbols = new Array(25);
var symbolData = [];

var streams = [];


//console.log(ctx.fontSize)

function setup() {

    getSymbols();

    getVideo();


    var x = 0;
    for (var i = 0; i <= canvas.width / fontSize; i++) {
      var stream = new Stream();
      stream.generateSymbols(x, (Math.random() - 1000));
      streams.push(stream);
      x += fontSize;
    }

    console.log(streams);

}


function Symbol(x, y, speed, first) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.first = first;
    this.value;
    this.average;

    this.setRandomSymbol = function(){
        var rand = Math.floor(Math.random() * 95);
        this.value = symbolData[rand][1];
    }

    this.setToVideoSymbol = function(){
        
        // this.value = symbolData[this.average][1];
        this.value = symbols[this.average];
    }

    this.animate = function(){
        this.y = (this.y >= canvas.height) ? 0 : this.y += this.speed;
    }
}


function Stream() {
    this.symbols = [];
    // this.totalSymbols = Math.round((Math.random() * (canvas.height / fontSize)) + 30);
    this.totalSymbols = canvas.height / fontSize;
    this.speed = (Math.random()* 6) + 3;
    var first = Math.round(Math.random() * 3) == 1;
    this.generateSymbols = function(x, y) {
        for (var i =0; i <= this.totalSymbols; i++) {
            
            symbol = new Symbol(x, y, this.speed, first);
            
            
            symbol.setRandomSymbol();
            this.symbols.push(symbol);
            
            y -= fontSize;
            first = false;
        }
    }

    this.getCorrectSymbols = function() {
        this.symbols.forEach(function(symbol) {

            var imgData = ctx.getImageData(symbol.x, symbol.y, 7, 12);            
            var brightness = getBrightness(imgData);
            total = brightness[0] / brightness[1];
            symbol.average = Math.floor(total / symbols.length);
            symbol.setToVideoSymbol();

        });
    }

    this.render = function() {

        this.symbols.forEach(function(symbol){

            if(symbol.first){
                ctx.fillStyle = "#09ff08";
            }else{
                ctx.fillStyle = "#00a800";
            }
            ctx.fillText(symbol.value, symbol.x, symbol.y);
            symbol.animate();
        });
    }
}



function paintToCanvas() {

    // const width = video.videoWidth;
    // const height = video.videoHeight;
    // // console.log(width, height);
    // canvas.width = width;
    // canvas.height = height;
    ctx.drawImage(video, 0, 0);
    // matrixFilter();
    matrixify();
    

    requestAnimationFrame(paintToCanvas)
}




function getSymbols() {

    // Get Katakana symbols
    var xcoor = 0;
    var count = 0;
    var ycoor = 10;

    for (var i = 0; i < 96; i++) {

        // get symbol, 0x30A0 is where Katakana starts
        symbol = String.fromCharCode(0x30A0 + i);

        if (((count * 12) + 20) > canvas.width) {
            count = 0;
        }

        if (count == 0) {
            ycoor += 10;
        }

        xcoor = (count * 12) + 20;

        ctx.fillText(symbol, xcoor, ycoor)

        // get the 'brightness' of the symbol, Black=000, so brightness is the amount of RGB in the symbol
        // getImageData(x, y, width, height)

        var imgData = ctx.getImageData(xcoor, ycoor - 10, 7, fontSize-1);

        // total is the total RGB value of the symbol
        var total = 0; //reset
        for (var j = 0; j < imgData.data.length; j += 4) {
            total += imgData.data[j] + imgData.data[j + 1] + imgData.data[j + 2];
        }

        var arr = new Array(2);
        arr[0] = total;
        arr[1] = symbol;
        //console.log(arr)
        symbolData.push(arr);
        count++;
    }

    // Sort symbols by total values
    symbolData.sort(function (a, b) { return a[0] - b[0]; });


    xcoor = 0;
    ycoor = 50;
    count = 0;
    // print for debug purposes
    for (var i = 0; i < symbolData.length; i++) {
        if (((count * 12) + 20) > canvas.width) {
            count = 0;
        }

        if (count == 0) {
            ycoor += 10;
        }

        xcoor = (count * 12) + 20;
        ctx.fillText(symbolData[i][1],xcoor, ycoor);

        count++;
    }

    // Take 20 symbols
    var interval = Math.floor(symbolData.length / symbols.length);
    var index = 0;
    for (var i = 0; i < symbols.length - 1 && index < symbolData.length; i++) {
        symbols[i] = symbolData[index][1];
        ctx.fillText(symbols[i], (i * 10) + 20, 90);
        index += interval;
    }

    symbols[symbols.length - 1] = symbolData[symbolData.length - 1][1];
    console.log(symbols);
    //pixels.reverse();
    ctx.fillText(symbols[symbols.length - 1], 15 * 6, 110);

}




function getBrightness(imgData) {
    var count = 1;
    var total = 0;
    for (var k = 0; k < imgData.data.length; k += 4) {
        total += ((0.2126 * imgData.data[k]) + (0.7152 * imgData.data[k + 1]) + (0.0722 * imgData.data[k + 2]));
        count++;
    }

    return [total, count]
}




function matrixify() {
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.fillText()
    streams.forEach(function(stream) {
        // var newStream = new Stream();
        // newStream.generateSymbols(stream.x, stream.y)
        // newStream.render();
        stream.getCorrectSymbols();
        // stream.render();
    });

    ctx.clearRect(0,0, canvas.width, canvas.height);

    streams.forEach(function(stream){
        stream.render();
    });
    
}




function matrixFilter() {

    // ctx.drawImage(video, 0, 0);
    var blockWidth = fontSize - 2;
    var blockHeight = fontSize - 1;

    rows = canvas.height / blockHeight;
    cols = canvas.width / blockWidth;

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var imgData = ctx.getImageData(j * blockWidth, i * blockHeight, blockWidth, blockHeight);
            var brightness = getBrightness(imgData);

            total = brightness[0] / brightness[1];

            var average = Math.floor(total / symbols.length);
            //console.log(average);
            ctx.clearRect(j * blockWidth, i * blockHeight, blockWidth, blockHeight);

            ctx.fillText(symbols[average], j * blockWidth, (i + 1) * blockHeight)

        }
    }
}




function getVideo() {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(localMediaStream => {
                console.log(localMediaStream)
                video.src = window.URL.createObjectURL(localMediaStream);
                video.play();
            })
            .catch(err => {
                console.error("Please enable your webcam", err);
            });
    }
}

function takePhoto() {
    const data1 = canvas.toDataURL("image/jpeg");
    console.log(data1);
    var link = document.createElement("a");
    link.href = data1;
    link.setAttribute("download", "matrix");
    link.innerHTML = `<img src="${data1}"/>`;
    strip.insertBefore(link, strip.firstChild);
}

setup();

video.addEventListener('canplay', paintToCanvas);
//window.setInterval(draw, 100);

