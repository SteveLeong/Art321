const video = document.getElementById("player");
const canvas = document.getElementById("photo");
const ctx = canvas.getContext("2d");
const strip = document.getElementById("strip");

ctx.font="12px monospace";
ctx.fillStyle="#00BB00";
var symbols = new Array(20);





function setup(){
    
    getSymbols();
    
    getVideo();
    
}




function getSymbols(){

    var symbolData = new Array();

    // Get Katakana symbols
    var xcoor = 0;
    var count = 0;
    var ycoor = 10;

    for(var i = 0; i < 96; i++){
        
        // get symbol, 0x30A0 is where Katakana starts
        symbol = String.fromCharCode(0x30A0 + i);

        if(((count*12) + 20) > canvas.width) {
            count = 0;
        }

        if(count == 0){
            ycoor += 10;
        }

        xcoor = (count*12) + 20;
        
        ctx.fillText(symbol,xcoor,ycoor)
        
        // get the 'brightness' of the symbol, Black=000, so brightness is the amount of RGB in the symbol
        // getImageData(x, y, width, height)
        
        var imgData=ctx.getImageData(xcoor, ycoor-10, 7, 11);

        // total is the total RGB value of the symbol
        var total = 0; //reset
        for (var j = 0; j < imgData.data.length; j += 4){
            total += imgData.data[j] + imgData.data[j + 1] + imgData.data[j + 2];
        }

        var arr = new Array(2);
        arr[0] = total;
        arr[1] = symbol;
        //console.log(arr)
        symbolData.push(arr);
        count++;
    }
    //console.log(symbolData);

    // Sort symbols by total values

    symbolData.sort(function(a,b) {return a[0] - b[0];});
    
    //console.log(symbolData);
    // print for debug purposes
    for(var i = 0; i < symbolData.length; i++)
    {
        ctx.fillText(symbolData[i][1],(i*10 )+ 20,50);
    }

    // Take 20 symbols

    var interval = Math.floor(symbolData.length/symbols.length);
    //console.log(symbolData.length, interval);

    var index = 0;
    for(var i = 0; i < symbols.length-1 && index < symbolData.length; i++ )
    {
        symbols[i] = symbolData[index][1];
        ctx.fillText(symbols[i],(i*10 )+ 20,60);
        index+= interval;
    }

    symbols[symbols.length-1] = symbolData[symbolData.length-1][1];
    console.log(symbols);
    //pixels.reverse();
    ctx.fillText(symbols[symbols.length-1],15*6,80);

}




function getVideo(){

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then (localMediaStream => {
            console.log(localMediaStream)
            video.src = window.URL.createObjectURL(localMediaStream);
            video.play();
        })
        .catch(err => {
            console.error("Please enable your webcam", err);
        });

}




function paintToCanvas(){

    // const width = video.videoWidth;
    // const height = video.videoHeight;
    // // console.log(width, height);
    // canvas.width = width;
    // canvas.height = height;

    ctx.drawImage(video, 0, 0);

    matrixFilter();
    //let pixels = ctx.getImageData(0, 0, width, height);

    //pixels = matrixify(pixels)

    //ctx.putImageData(pixels, 0, 0);

    requestAnimationFrame(paintToCanvas)
}




function matrixFilter() {
    var fontsize = 12;
    var blockWidth = fontsize - 2;
    var blockHeight = fontsize - 1;

    rows = canvas.height/blockHeight;
    cols = canvas.width/blockWidth;

    for(var i=0; i < rows; i++){
        for(var j = 0; j < cols; j++) {
            var imgData=ctx.getImageData(j*blockWidth,i*blockHeight,blockWidth,blockHeight);
            var brightness = getBrightness(imgData);

            total = brightness[0] / brightness[1];
            
            var average = Math.floor(total / symbols.length);
            //console.log(average);
            ctx.clearRect(j*blockWidth,i*blockHeight, blockWidth, blockHeight);	

            ctx.fillText(symbols[average],j*blockWidth,(i+1)*blockHeight)
            
        }
    }
}




function getBrightness(imgData) {
    var count = 1;
    var total = 0;
    for (var k=0; k < imgData.data.length; k+=4)
    {
        total += ((0.2126*imgData.data[k]) + (0.7152*imgData.data[k+1]) + (0.0722*imgData.data[k+2]));
        count++;
    }

    return [total, count]
}

setup();

video.addEventListener('canplay', paintToCanvas);
//window.setInterval(draw, 100);

