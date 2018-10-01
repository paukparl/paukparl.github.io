var canvas = new Canvas();

var emojiList = [];







var emojiPool = new EmojiPool();

var layerPanel = new LayerPanel();

emojiPool.loadEmojiPool();

redraw();










function redraw() {
  requestAnimationFrame(redraw)
  canvas.draw();
}

function saveImageData(canvas, w, h) {
  console.log(canvas);
  var unitSize = canvas.unitSize * canvas.dpr;
  var canvasWidth = canvas.canvasWidth * canvas.dpr;
  var imgData = canvas.ctx.getImageData(unitSize, unitSize, canvasWidth, canvasWidth);
  var newCanvas = document.createElement('canvas');
  newCanvas.width = w;
  newCanvas.height = h;
  newCanvas.ctx = newCanvas.getContext('2d');
  newCanvas.ctx.scale(4, 4);
  newCanvas.ctx.putImageData(imgData, 0, 0);
  
  download(newCanvas.toDataURL("image/png"), '1.png');
}



window.addEventListener('keydown', function(event) {
  // If down arrow was pressed...
  if (event.keyCode == 32) { 
    placeEmoji(0, 0, 1, 1, 0, 0);
  }
  if (event.keyCode == 13) {

    saveImageData(canvas, 300, 300);
    
  }
});







function EmojiPool() {
  this.emojiPool = [];

  this.loadEmojiPool = function() {
    var xhttp = new XMLHttpRequest();
    var root = this;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        root.emojiPool = xhttp.responseText.split(' ');
        root.displayemojiPool();
      }
    };
    xhttp.open("GET", "emojis.txt", true);
    xhttp.send(); 
  }

  this.displayemojiPool = function() {
    var root = this;
    var emojiPoolDiv = document.getElementById('emoji-pool');
    
    for (i in this.emojiPool){
      var emojiDiv = document.createElement('div');
      emojiDiv.classList.add('emoji-div');
      emojiDiv.addEventListener('click', function(event) {
        // EMOJI ENTER!!!!
        root.addEmoji(event.target.firstChild.innerText);
        
      });
      var emoji = document.createElement('p');
      emoji.innerText = this.emojiPool[i];
      emojiDiv.appendChild(emoji);
      emojiPoolDiv.appendChild(emojiDiv);
    }
    
  }


  this.addEmoji = function(chr){
    var newEmoji = new Emoji(canvas, chr, 0, 0, canvas.canvasWidth, canvas.canvasHeight, 0, 0);
    emojiList.push(newEmoji);
    layerPanel.addLayerDiv(newEmoji, 0);
  }
}



function Canvas() {
  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('id', 'canvas');
  document.getElementById('canvas-container').appendChild(this.canvas);
  
  this.dpr = window.devicePixelRatio || 1; ///// lets use this later
  this.canvas.width = 1080 * this.dpr;
  this.canvas.height = 1080 * this.dpr;

  console.log(this.canvas.width);
  
  this.ctx = this.canvas.getContext('2d');

  this.ctx.scale(this.dpr, this.dpr);
  this.canvas.style.width = this.canvas.parentNode.offsetWidth + 'px';
  this.canvas.style.height = this.canvas.parentNode.offsetHeight + 'px';

  
  this.ctx.globalCompositeOperation = 'overlay';

  // this.unitSize = window.innerHeight/8;
  this.canvasWidth = 1080;
  this.canvasHeight = 1080;

  this.changeBlend = function(newMode) {
    this.ctx.globalCompositeOperation = newMode;
  }
  // this.addEmoji = function(chr) {
    // var newEmoji = new Emoji(this, chr, 0, 0, this.canvasWidth, this.canvasHeight, 0, 0);
    // emojiList.push(newEmoji);
  // }
  this.draw = function() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // for (emoji in this.emojiList) {
    // console.log(this.emojiOnCanvas);
    for (var i = emojiList.length-1; i >= 0; i--) {
      console.log(emojiList.length);
      emojiList[i].draw();
      // console.log('chr');
    }
  }
}



function LayerPanel() {
  var container = document.getElementById('layer-panel');
  
  this.addLayerDiv = function(emoji, location) {
    
    var layerDiv = document.createElement('div');
    layerDiv.classList.add('layer-div');
    var layerThumbnail = document.createElement('h1');
    layerThumbnail.innerText = emoji.chr;
    layerDiv.appendChild(layerThumbnail);

    // if empty, go to else, if existing layers, insert on top
    if (container.firstChild) {
      container.insertBefore(layerDiv, container.firstChild);
    } else{ 
      console.log('empty');
      container.appendChild(layerDiv);
    }
    console.log(layerDiv);
  }
}








function Emoji(canvasObj, chr, x, y, w, h) {
  this.chr = chr;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yoff = -0.075;

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
    // console.log('shit');
    canvasObj.ctx.font = this.h + "px Times";
    canvasObj.ctx.strokeText(chr, this.x, this.y + this.h * (1+this.yoff));
  }

  
}

