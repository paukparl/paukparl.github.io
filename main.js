var canvas = new Canvas();

var emojiList = [];

var emojiPool = new EmojiPool();

var layerPanel = new LayerPanel();

emojiPool.loadEmojiPool();

redraw();



var emojiOnFocus = null;








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
    var emojiPoolDiv = document.getElementById('emoji-pool-div');
    
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
    var newEmoji = new Emoji(canvas, chr, 50, 50, 540, 540, 0, 0);
    emojiList.push(newEmoji);
    layerPanel.addLayerDiv(newEmoji, 0);
  }
}



function Canvas() {
  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('id', 'canvas');
  document.getElementById('canvas-container').appendChild(this.canvas);
  
  this.dpr = window.devicePixelRatio || 1; ///// lets use this later
  this.canvas.width = 640 * this.dpr;
  this.canvas.height = 640 * this.dpr;

  console.log(this.canvas.width);
  
  this.ctx = this.canvas.getContext('2d');

  this.ctx.scale(this.dpr, this.dpr);
  // this.canvas.style.width = this.canvas.parentNode.offsetWidth + 'px';
  // this.canvas.style.height = this.canvas.parentNode.offsetHeight + 'px';
  this.canvas.style.width = '640px';
  this.canvas.style.height = '640px';
  
  
  // this.ctx.globalCompositeOperation = 'overlay';

  // this.unitSize = window.innerHeight/8;
  this.canvasWidth = 640;
  this.canvasHeight = 640;

  this.setBlend = function(newMode) {
    this.ctx.globalCompositeOperation = newMode;
  }
  
  this.draw = function() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // DRAW EMOJIS
    for (i in emojiList) {
      this.setBlend(emojiList[i].blendMode);
      emojiList[i].draw();
    }
    console.log(this.dpr);

    // DRAW MARGIN
    this.ctx.globalCompositeOperation = 'xor';

    this.ctx.fillStyle = 'rgba(250, 250, 250, 0.85)';
    this.ctx.fillRect(0,0,50,640);
    this.ctx.fillRect(50,0,540,50);
    this.ctx.fillRect(50,590,540,50);
    this.ctx.fillRect(590,0,50,640);

    // DRAW FOCUS BOX
    for (i in emojiList) {
      if (emojiList[i].onFocus) {
        var f = emojiList[i];
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle='lime';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(f.x,f.y,f.w,f.h);
      }
    }

  }
}





function LayerPanel() {
  var container = document.getElementById('layer-panel-div');
  
  this.addLayerDiv = function(emoji, location) {
    
    var layerDiv = document.createElement('div');
    layerDiv.classList.add('layer-div');
    var layerThumbnail = document.createElement('h1');
    layerThumbnail.innerText = emoji.chr;
    layerDiv.appendChild(layerThumbnail);

    layerThumbnail.addEventListener('click', function() {
      for (i in emojiList) {
        emojiList[i].onFocus = false;
      }
      emoji.onFocus = true;
    });


    

    // CREATE BLEND-MODE DROP-DOWN
    
    var blendModeSelect = document.createElement('div');
    
    
    var blendModeSelectTag = document.createElement('select');
    for (i in emoji.blendModeList) {
      var thisBlendMode = emoji.blendModeList[i];
      var thisOption = document.createElement('option');
      thisOption.setAttribute('value', thisBlendMode);
      thisOption.innerText = thisBlendMode;
      blendModeSelectTag.appendChild(thisOption);
    }
    
    blendModeSelect.appendChild(blendModeSelectTag);
    layerDiv.appendChild(blendModeSelect);
    blendModeSelect.classList.add('custom-select');
    blendModeSelect.style.width='200px';




    // SUPER SHIT CODE ALERT (grabbed from https://www.w3schools.com/howto/howto_custom_select.asp)
    var x, i, j, selElmnt, a, b, c;
    /*look for any elements with the class "custom-select":*/
    x = blendModeSelect;
    
    selElmnt = x.getElementsByTagName("select")[0];
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement('div');
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x.appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement('div');
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < selElmnt.length; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement('div');
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          /*when an item is clicked, update the original select box,
          and the selected item:*/
          var y, i, k, s, h;
          
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
          emoji.changeBlendMode(selElmnt.value);
      });
      b.appendChild(c);
    }
    x.appendChild(b);
    a.addEventListener("click", function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });






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

  this.onFocus;

  var startX;
  var startY;
  var pastX = x ;
  var pastY = y ;

  var emoji = this;

  // TURN OF ALL FOCUSES EXCEPT THIS ONE
  for (i in emojiList) {
    emojiList[i].onFocus = false;
  }
  this.onFocus = true;


  createDragDiv();
  

  this.blendModeList = [
    'source-over',
    'multiply',
    'overlay'
  ]

  this.blendMode = 'source-over';

  this.changeBlendMode = function(newMode) {
    this.blendMode = newMode;
  }

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
    console.log(this.onFocus);
    canvasObj.ctx.font = this.h + "px Times";
    canvasObj.ctx.strokeText(chr, this.x, this.y + this.h * (1+this.yoff));
  }

  
}










function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);








