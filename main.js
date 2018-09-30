var unitSize = 100;


function Canvas() {
  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('id', 'canvas');
  document.body.appendChild(this.canvas);
  
  var dpr = window.devicePixelRatio || 1; ///// lets use this later
  this.canvas.width = this.canvas.parentNode.offsetHeight * dpr;
  this.canvas.height = this.canvas.parentNode.offsetHeight * dpr;

  // this.width = this.canvas.offsetWidth;
  // this.height = this.canvas.odffsetHeight;

  // this.canvas.width = 500;
  // this.canvas.height = 500;
  console.log(this.canvas.width);
  
  this.ctx = this.canvas.getContext('2d');

  
  var dpr = window.devicePixelRatio || 1; ///// lets use this later
  this.ctx.scale(dpr, dpr);
  this.canvas.style.width = window.innerHeight + 'px';
  this.canvas.style.height = window.innerHeight;

  
  this.ctx.globalCompositeOperation = 'color-dodge';

  this.emojiList = [];
  
  this.changeBlend = function(newMode) {
    this.ctx.globalCompositeOperation = newMode;
  }

  this.testEmoji = null;


  this.addEmoji = function(chr) {
    var newEmoji = new Emoji(this, chr, 0, 0, 800, 800, 0, 0);
    this.emojiList.push(newEmoji);
  }
  
  this.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // for (emoji in this.emojiList) {
    
    for (var i in this.emojiList) {
      this.emojiList[i].draw();
    }
    // this.emojiList[0].draw();
      // console.log(emoji.draw());
    // }
    // console.log('shit');
  }
  

}


function Emoji(canvasObj, chr, x, y, w, h) {
  this.chr = chr;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yoff = -0.07125;

  var startX;
  var startY;
  var pastX = x ;
  var pastY = y ;

  var emoji = this;
  createDragDiv();
  

  function createDragDiv() {
    // console.log(this);
    var dragDiv = document.createElement('div');
    dragDiv.setAttribute('draggable', 'true');
    // dragDiv.setAttribute('id', 'test');
    dragDiv.style.left = pastX + 'px';
    dragDiv.style.top = pastY + 'px';
    dragDiv.style.width = emoji.w + 'px';
    dragDiv.style.height = emoji.h + 'px';
    console.log(emoji.w);

    dragDiv.addEventListener("dragstart", function(event) {
      startX = event.clientX;
      startY = event.clientY;
      console.log(pastX);
    }, false);

    dragDiv.addEventListener("drag", function(event) {
      if (event.clientX == 0 || event.clientY == 0) return; // prevent emoji position returning to zero due to client pos = 0 at drag end
      emoji.x = pastX + event.clientX - startX;
      emoji.y = pastY + event.clientY - startY;
      console.log(emoji.x + ' ' + pastX);
    }, false);

    dragDiv.addEventListener("dragend", function(event) {
      // endX = event.clientX;
      emoji.x = pastX + event.clientX - startX;
      emoji.y = pastY + event.clientY - startY;
      dragDiv.style.left = emoji.x + 'px';
      dragDiv.style.top = emoji.y+ 'px';
      pastX = emoji.x;
      pastY = emoji.y;
      // console.log(pastX);
    }, false);
    document.body.appendChild(dragDiv);
    this.dragDiv = dragDiv;
  }


  // draw emoji
  this.draw = function() {
    canvasObj.ctx.font = this.h + "px Times";
    canvasObj.ctx.strokeText(chr, this.x, this.y + this.h * (1+this.yoff));
  }

  
}






var testCanvas = new Canvas();
// console.log(testCanvas);




var totalEmojiList;


var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    totalEmojiList = xhttp.responseText.split(' ');
    var randomNumber = Math.floor(Math.random() * Math.floor(totalEmojiList.length));
    testCanvas.addEmoji(totalEmojiList[randomNumber]);
    var randomNumber = Math.floor(Math.random() * Math.floor(totalEmojiList.length));
    testCanvas.addEmoji(totalEmojiList[randomNumber]);
    var randomNumber = Math.floor(Math.random() * Math.floor(totalEmojiList.length));
    testCanvas.addEmoji(totalEmojiList[randomNumber]);
    // testCanvas.addEmoji('😎');
  }
};
xhttp.open("GET", "emojis.txt", true);
xhttp.send(); 








// testCanvas.draw();


function redraw() {
  requestAnimationFrame(redraw)
  // testCanvas.testEmoji.pixelX = deltaX;
  testCanvas.draw();
  // console.log('shit');
}

redraw();


// var draw = function() {

//   requestAnimationFrame( draw );
// }


var dragged = null;


var startX = null;
// var endX = null;

var deltaX = null;

























window.addEventListener('keydown', function(event) {
  // If down arrow was pressed...
  if (event.keyCode == 32) { 
    placeEmoji(0, 0, 1, 1, 0, 0);
  }
  if (event.keyCode == 13) {
    // html2canvas(document.getElementById('canvas')).then(function(canvas) {
    download(document.getElementById('canvas').toDataURL("image/png"), '1.png');
      // document.body.appendChild(canvas);
      // var canvas = document.getElementById("mycanvas");
      // var img = ;
      // download()
      // // document.write('<img src="'+img+'"/>'); 
      // document.download(img);
    
  }
});










// function download(canvas, filename) {
//   /// create an "off-screen" anchor tag
//   var lnk = document.createElement('a'), e;

//   /// the key here is to set the download attribute of the a tag
//   lnk.download = filename;

//   /// convert canvas content to data-uri for link. When download
//   /// attribute is set the content pointed to by link will be
//   /// pushed as "download" in HTML5 capable browsers
//   lnk.href = canvas.toDataURL("image/png;base64");

//   /// create a "fake" click-event to trigger the download
//   if (document.createEvent) {
//     e = document.createEvent("MouseEvents");
//     e.initMouseEvent("click", true, true, window,
//                      0, 0, 0, 0, 0, false, false, false,
//                      false, 0, null);

//     lnk.dispatchEvent(e);
//   } else if (lnk.fireEvent) {
//     lnk.fireEvent("onclick");
//   }
// }










// var element = document.getElementById('grid-snap'),




























// var vm = new Vue({
//   el: '#app',
//   data: {
//       emojiList: [],
//       canvasHeight: null,
//       cellHeight: null,
//       resizing: false,
//       canvasEntered: false,
//       dragStarted: false,
//       event: null,
//       currentContainer: null,
//       currentWidth: null,
//       currentHeight: null,
//       currentTop: null,
//       currentLeft: null,
//       currentScaleX: null,
//       currentScaleY: null,

//       unitSize: null,
//       canvas: null,

//   },
//   methods: {

    
//     placeEmoji: function(x, y, w0, h0, w1, h1) {
      
//       var vm = this;

//       var randomNumber = Math.floor(Math.random() * Math.floor(vm.emojiList.length));
//       var emoji = document.createElement('div');
//       emoji.classList.add('emoji')
//       emoji.innerText = vm.emojiList[randomNumber];
//       emoji.style.fontSize = this.cellHeight + 'px';
//       emoji.style.top = this.cellHeight* -0.08 + 'px';
//       // console.log('🐶');
//       var emojiContainer = document.createElement('div');
//       emojiContainer.appendChild(emoji);
//       emojiContainer.classList.add('emojiContainer')
//       emojiContainer.style.width = w0 * this.cellHeight + 'px';
//       emojiContainer.style.height = h0 * this.cellHeight + 'px';
//       emojiContainer.style.left = x * this.cellHeight + 'px';
//       emojiContainer.style.top = y * this.cellHeight + 'px';
//       this.currentWidth = w0 * this.cellHeight;
//       this.currentHeight = h0 * this.cellHeight;
//       this.currentLeft = x * this.cellHeight;
//       this.currentTop = y * this.cellHeight;
//       document.getElementById('canvas').appendChild(emojiContainer);


//       emojiContainer.addEventListener('move', function(event) {
//         vm.currentTop += event.detail[1];
//         vm.currentLeft += event.detail[0];
//         emojiContainer.style.left = vm.currentLeft + 'px';
//         emojiContainer.style.top = vm.currentTop + 'px';
//       })



//       emojiContainer.addEventListener('resize', function(event) {
//         // console.log(event.detail);
//         vm.currentWidth += event.detail.width;
//         // console.log(vm.currentTop);  
//         vm.currentHeight += event.detail.height;
//         vm.currentTop += event.detail.top;
//         vm.currentLeft += event.detail.left;
//         emojiContainer.style.width = vm.currentWidth + 'px';
//         emojiContainer.style.height = vm.currentHeight + 'px';
//         emojiContainer.style.left = vm.currentLeft + 'px';
//         emojiContainer.style.top = vm.currentTop*2 + 'px';

//         console.log(emoji.childElementCount);

//         emoji.style.transformOrigin = 'top left';
//         // emoji.style.transform = 'translateY(-300px)';
//         // emoji.style.height = vm.currentHeight;
//         emoji.style.transform = 'scale('+ vm.currentWidth/vm.cellHeight +', ' + vm.currentHeight/vm.cellHeight +')';
        
//         // emoji.style.left = vm.currentWidth/4 + 'px';
//         // emoji.style.top = vm.currentHeight/4 + 'px';
//         // if (event.detail.width) {
//         //   emoji.style.transform = 'scaleX('+ vm.currentWidth/vm.cellHeight +')';
//         //   vm.currentScaleX = vm.currentWidth/vm.cellHeight;
//         // }
//         // if (event.detail.height) {
//         //   emoji.style.transform = 'scaleY('+ vm.currentHeight/vm.cellHeight +')';
//         //   vm.currentScaleY = vm.currentHeight/vm.cellHeight;
//         // }

        
//       });
//       this.currentContainer = emojiContainer;


//       var smartDiv = document.createElement('div');
//       smartDiv.classList.add('drag-resize');
//       smartDiv.style.width = this.cellHeight + 'px';
//       smartDiv.style.height = this.cellHeight + 'px';
//       smartDiv.style.zIndex = 1;
//       document.getElementById('canvas').appendChild(smartDiv);
      








//     }
//   },
//   mounted: function(){
//     this.canvas = Canvas(document.getElementById('canvas'));
//     var test = Emoji("🌠", 0, 0, 1, 1, 0, 0);
//     console.log(test);
//   }
// })