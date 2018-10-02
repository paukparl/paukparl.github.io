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
  var imgData = canvas.ctx.getImageData(100, 100, 1080, 1080);
  var newCanvas = document.createElement('canvas');
  newCanvas.width = 1080;
  newCanvas.height = 1080;
  newCanvas.ctx = newCanvas.getContext('2d');
  newCanvas.ctx.putImageData(imgData, 0, 0);
  download(newCanvas.toDataURL("image/png"), '1.png');
}



window.addEventListener('keydown', function(event) {
  // If down arrow was pressed...
  if (event.keyCode == 32) { 
    placeEmoji(0, 0, 1, 1, 0, 0);
  }
  if (event.keyCode == 13) {
    saveImageData(canvas, 540, 540);
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
  document.getElementById('canvas-container-div').appendChild(this.canvas);

  this.canvas2 = document.createElement('canvas');
  this.canvas2.setAttribute('id', 'canvas2');
  document.getElementById('canvas-container-div').appendChild(this.canvas2);
  
  this.dpr = window.devicePixelRatio || 1; ///// lets use this later
  this.canvas.width = 640 * this.dpr;
  this.canvas.height = 640 * this.dpr;
  
  this.canvas2.width = 640 * this.dpr;
  this.canvas2.height = 640 * this.dpr;
  
  this.ctx = this.canvas.getContext('2d');

  this.ctx2 = this.canvas2.getContext('2d');

  this.ctx.scale(this.dpr, this.dpr);
  this.ctx2.scale(this.dpr, this.dpr);
  // this.canvas.style.width = this.canvas.parentNode.offsetWidth + 'px';
  // this.canvas.style.height = this.canvas.parentNode.offsetHeight + 'px';
  this.canvas.style.width = '640px';
  this.canvas.style.height = '640px';

  this.canvas2.style.width = '640px';
  this.canvas2.style.height = '640px';
  

  // CONTROL MODES
  this.resizeLeft = false;
  this.resizeRight = false;
  this.resizeTop = false;
  this.resizeBottom = false;
  this.move = false;

  // RESIZING STATE
  this.resizing = false;

  // EMOJI DATA PRIOR TO RESIZE
  this.x0 = null;
  this.y0 = null;
  this.w0 = null;
  this.h0 = null;
  this.mouseX0 = null;
  this.mouseY0 = null;

  // this.unitSize = window.innerHeight/8;
  this.canvasWidth = 640;
  this.canvasHeight = 640;





  this.setBlend = function(newMode) {
    this.ctx.globalCompositeOperation = newMode;
  }



  var mouseX;
  var mouseY;

  this.canvas.addEventListener('mousemove', function(event) {
    mouseX = event.clientX - canvas.canvas.parentNode.parentNode.offsetLeft;
    mouseY = event.clientY - canvas.canvas.parentNode.parentNode.offsetTop -30;
    // console.log(canvas.canvas.parentNode);




    if (this.resizing) {
      if (this.resizeLeft) {
        console.log('left');
        emojiOnFocus.x = mouseX;
        emojiOnFocus.w = this.x0 + this.w0 - emojiOnFocus.x;
      }

      if (this.resizeRight) {
        emojiOnFocus.w = mouseX - emojiOnFocus.x;
        console.log('right');
      }

      if (this.resizeTop) {
        emojiOnFocus.y = mouseY;
        emojiOnFocus.h = this.y0 + this.h0 - emojiOnFocus.y;
      }

      if (this.resizeBottom) {
        emojiOnFocus.h = mouseY - emojiOnFocus.y;
      }
    }

    if (this.moving) {
      emojiOnFocus.x = this.x0 + mouseX - this.mouseX0;
      emojiOnFocus.y = this.y0 + mouseY - this.mouseY0;
    }



    
    if (!emojiOnFocus) return;

    // RESET EDGE EVENTS
    this.inside= false;
    this.leftEdge= false;
    this.rightEdge= false;
    this.topEdge = false;
    this.bottomEdge = false;

    this.resizeLeft = false;
    this.resizeTop = false;
    this.resizeBottom = false;
    this.resizeRight = false;
    this.move = false;

    // DEFINE SHORTCUTS
    var x = emojiOnFocus.x;
    var y = emojiOnFocus.y;
    var w = emojiOnFocus.w;
    var h = emojiOnFocus.h;
    var off = 15;

    // DETECT INSIDE
    if (x < mouseX
        && x+w > mouseX
        && y < mouseY
        && y+h > mouseY) {
      this.inside = true;
    } 

    // DETECT EDGE
    if (y-off < mouseY && mouseY < y+h+off) {
      if (x-off < mouseX && mouseX < x+off)
      {
        this.leftEdge = true;
      }
      if (x+w-off < mouseX && mouseX < x+w+off) {
        this.rightEdge = true;
      }
    }

    if (x-off < mouseX && mouseX < x+w+off) {
      if (y-off < mouseY && mouseY < y+off) {
        this.topEdge = true;
      }
      if (y+h-off < mouseY && mouseY < y+h+off) {
        this.bottomEdge = true;
      }
    }


    // DEFINE CONTROL MODE
    if (this.leftEdge || this.rightEdge) {
      canvas.canvas.style.cursor = 'ew-resize';

      if (this.leftEdge) {
        this.resizeLeft = true;
      } else {
        this.resizeRight = true;
      }

      if (this.topEdge && this.leftEdge
          || this.bottomEdge && this.rightEdge) {
        canvas.canvas.style.cursor = 'nwse-resize';

        if (this.topEdge) {
          this.resizeTop = true;
          this.resizeLeft = true;
        } else {
          this.resizeBottom = true;
          this.resizeRight = true;
        }

      } 
      if (this.bottomEdge && this.leftEdge
        || this.topEdge && this.rightEdge) {
        canvas.canvas.style.cursor = 'nesw-resize';

        if (this.topEdge) {
          this.resizeTop = true;
          this.resizeRIght = true;
        } else {
          this.resizeBottom = true;
          this.resizeLeft = true;
        }

      }
    }
    else if (this.bottomEdge || this.topEdge) {
      canvas.canvas.style.cursor = 'ns-resize';

      if (this.topEdge) {
        this.resizeTop = true;
      } else {
        this.resizeBottom = true;
      }

      if (this.topEdge && this.leftEdge
          || this.bottomEdge && this.rightEdge) {
        canvas.canvas.style.cursor = 'nwse-resize';

        if (this.topEdge) {
          this.resizeTop = true;
          this.resizeLeft = true;
        } else {
          this.resizeBottom = true;
          this.resizeRight = true;
        }

      } 
      if (this.topEdge && this.leftEdge
        || this.bottomEdge && this.rightEdge) {
        canvas.canvas.style.cursor = 'nesw-resize';

        if (this.topEdge) {
          this.resizeTop = true;
          this.resizeRIght = true;
        } else {
          this.resizeBottom = true;
          this.resizeLeft = true;
        }
      }
    }
    else if (this.inside) {
      canvas.canvas.style.cursor = 'move';
      this.move = true;
    }
    else {
      canvas.canvas.style.cursor = 'default';
    }
  })





  this.canvas.addEventListener('mousedown', function(event) {
    if (this.resizeLeft
        ||this.resizeRight
        ||this.resizeTop
        ||this.resizeBottom) {
      this.x0 = emojiOnFocus.x;
      this.y0 = emojiOnFocus.y;
      this.w0 = emojiOnFocus.w;
      this.h0 = emojiOnFocus.h;
      this.resizing = true;
    }
    if (this.move) {
      this.x0 = emojiOnFocus.x;
      this.y0 = emojiOnFocus.y;
      this.mouseX0 = mouseX;
      this.mouseY0 = mouseY;
      this.moving = true;
    }
  })
  this.canvas.addEventListener('mouseup', function(event) {
    this.resizing = false;
    this.moving = false;
  })
  
  this.draw = function() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx2.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // DRAW EMOJIS
    for (i in emojiList) {
      this.setBlend(emojiList[i].blendMode);
      emojiList[i].draw();
    }

    // DRAW MARGIN
    this.setBlend('xor');
    this.ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
    this.ctx.fillRect(0,0,50,640);
    this.ctx.fillRect(50,0,540,50);
    this.ctx.fillRect(50,590,540,50);
    this.ctx.fillRect(590,0,50,640);

    // DRAW FOCUS BOX
    for (i in emojiList) {
      if (emojiList[i].onFocus) {
        var f = emojiList[i];
        this.setBlend('source-over');
        this.ctx2.strokeStyle='red';
        this.ctx2.lineWidth = 2;
        this.ctx2.strokeRect(f.x,f.y,f.w,f.h);
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
    // blendModeSelect.style.width='200px';




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








function Emoji(canvasObj, chr) {
  this.chr = chr;
  this.x = 50;
  this.y = 50;
  this.w = 540;
  this.h = 540;
  this.yoff = -0.075;

  this.onFocus;


  var emoji = this;

  // TURN OFF ALL FOCUSES EXCEPT THIS ONE
  for (i in emojiList) {
    emojiList[i].onFocus = false;
  }
  this.onFocus = true;
  emojiOnFocus = this;

  

  this.blendModeList = [
    'source-over',
    'multiply',
    'overlay',
    'lighten'
  ]

  this.blendMode = 'source-over';

  this.changeBlendMode = function(newMode) {
    this.blendMode = newMode;
  }

  
  this.dimensionToScale = function(x, y, w, h) {
    canvasObj.ctx.save();
    canvasObj.ctx.font = w + "px Times";
    canvasObj.ctx.translate(x, h*(1+this.yoff) + y);
    canvasObj.ctx.scale(1, h/w);
    canvasObj.ctx.strokeText(chr, 0, w/h);
    canvasObj.ctx.restore();
  }
  

  // draw emoji
  this.draw = function() {
    this.dimensionToScale(this.x, this.y, this.w, this.h);
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








