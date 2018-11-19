const video = document.getElementById("player");
const canvas = document.getElementById("photo");
const context = canvas.getContext("2d");
const strip = document.getElementById("strip");

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
    const width = video.videoWidth;
    const height = video.videoHeight;
    // console.log(width, height);
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        context.drawImage(video, 0, 0, width, height);
        let pixels = context.getImageData(0, 0, width, height);

        pixels = matrixify()

        context.putImageData(pixels, 0, 0);

    }, 16);
}

function matrixify(pixels){
    for(let i = 0; i < pixels.data.length; i += 4){
        // Edit individual pixels
    }

    return pixels
}

getVideo();

video.addEventListener('canplay', paintToCanvas);