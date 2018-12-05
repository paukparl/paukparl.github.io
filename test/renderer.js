
const video = document.getElementById('video');
// if (!gl) {
//   console.log('NO WEBGL?!')
// }



loadVideo();


function loadVideo() {
  navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  .then(function(stream) {
    console.log(stream.getVideoTracks());
    video.srcObject = stream;
    video.play();
    video.addEventListener('playing', function() {
      playing = true;
      if (playing && timeupdate) {
        copyVideo = true;
      }
   }, true);
 
   video.addEventListener('timeupdate', function() {
      timeupdate = true;
      if (playing && timeupdate) {
        copyVideo = true;
      }
   }, true);
  })
  .catch(function(err) {
    console.log("An error occurred! " + err);
  });
}

