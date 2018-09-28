var vm = new Vue({
  el: '#app',
  data: {
      emojiList: [],
      canvasHeight: null,
      cellHeight: null,
      resizing: false,
      canvasEntered: false,
      dragStarted: false,
      event: null,
      currentContainer: null,
      currentWidth: null,
      currentHeight: null,
      currentTop: null,
      currentLeft: null,
      currentScaleX: null,
      currentScaleY: null,

  },
  methods: {

    
    placeEmoji: function(x, y, w0, h0, w1, h1) {
      
      var vm = this;

      var randomNumber = Math.floor(Math.random() * Math.floor(vm.emojiList.length));
      var emoji = document.createElement('div');
      emoji.classList.add('emoji')
      emoji.innerText = vm.emojiList[randomNumber];
      emoji.style.fontSize = this.cellHeight + 'px';
      emoji.style.top = this.cellHeight* -0.08 + 'px';
      // console.log('🐶');
      var emojiContainer = document.createElement('div');
      emojiContainer.appendChild(emoji);
      emojiContainer.classList.add('emojiContainer')
      emojiContainer.style.width = w0 * this.cellHeight + 'px';
      emojiContainer.style.height = h0 * this.cellHeight + 'px';
      emojiContainer.style.left = x * this.cellHeight + 'px';
      emojiContainer.style.top = y * this.cellHeight + 'px';
      this.currentWidth = w0 * this.cellHeight;
      this.currentHeight = h0 * this.cellHeight;
      this.currentLeft = x * this.cellHeight;
      this.currentTop = y * this.cellHeight;
      document.getElementById('canvas').appendChild(emojiContainer);


      emojiContainer.addEventListener('move', function(event) {
        vm.currentTop += event.detail[1];
        vm.currentLeft += event.detail[0];
        emojiContainer.style.left = vm.currentLeft + 'px';
        emojiContainer.style.top = vm.currentTop + 'px';
      })



      emojiContainer.addEventListener('resize', function(event) {
        // console.log(event.detail);
        vm.currentWidth += event.detail.width;
        // console.log(vm.currentTop);  
        vm.currentHeight += event.detail.height;
        vm.currentTop += event.detail.top;
        vm.currentLeft += event.detail.left;
        emojiContainer.style.width = vm.currentWidth + 'px';
        emojiContainer.style.height = vm.currentHeight + 'px';
        emojiContainer.style.left = vm.currentLeft + 'px';
        emojiContainer.style.top = vm.currentTop*2 + 'px';

        console.log(emoji.childElementCount);

        emoji.style.transformOrigin = 'top left';
        // emoji.style.transform = 'translateY(-300px)';
        // emoji.style.height = vm.currentHeight;
        emoji.style.transform = 'scale('+ vm.currentWidth/vm.cellHeight +', ' + vm.currentHeight/vm.cellHeight +')';
        
        // emoji.style.left = vm.currentWidth/4 + 'px';
        // emoji.style.top = vm.currentHeight/4 + 'px';
        // if (event.detail.width) {
        //   emoji.style.transform = 'scaleX('+ vm.currentWidth/vm.cellHeight +')';
        //   vm.currentScaleX = vm.currentWidth/vm.cellHeight;
        // }
        // if (event.detail.height) {
        //   emoji.style.transform = 'scaleY('+ vm.currentHeight/vm.cellHeight +')';
        //   vm.currentScaleY = vm.currentHeight/vm.cellHeight;
        // }

        
      });
      this.currentContainer = emojiContainer;


      var smartDiv = document.createElement('div');
      smartDiv.classList.add('drag-resize');
      smartDiv.style.width = this.cellHeight + 'px';
      smartDiv.style.height = this.cellHeight + 'px';
      smartDiv.style.zIndex = 1;
      document.getElementById('canvas').appendChild(smartDiv);
      








    }
  },
  mounted: function(){
      var vm = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          emojiList = xhttp.responseText.split(' ');
          // console.log(emojiList);
          vm.emojiList = emojiList;
        }
      };
      xhttp.open("GET", "emojis.txt", true);
      xhttp.send(); 

      this.canvasHeight = this.$refs.app.clientHeight * 0.75;
      this.cellHeight = this.canvasHeight/6;


      document.getElementById('canvas').addEventListener('mouseenter', function(event){
        vm.canvasEntered = true;
        
      })
      document.getElementById('canvas').addEventListener('mouseleave', function(event){
        vm.canvasEntered = false;
        
      })
      
      var vm=this;
      window.addEventListener('keydown', function(event) {
        // If down arrow was pressed...
        if (event.keyCode == 32) { 
          vm.placeEmoji(0, 0, 1, 1, 0, 0);
        }
        if (event.keyCode == 13) {
          html2canvas(document.getElementById('canvas')).then(function(canvas) {
            download(canvas.toDataURL("image/png"), '1.png');
            // document.body.appendChild(canvas);
            // var canvas = document.getElementById("mycanvas");
            // var img = ;
            // download()
            // // document.write('<img src="'+img+'"/>'); 
            // document.download(img);
            
        });
        }
      });

      
  }
})





function download(canvas, filename) {
  /// create an "off-screen" anchor tag
  var lnk = document.createElement('a'), e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL("image/png;base64");

  /// create a "fake" click-event to trigger the download
  if (document.createEvent) {
    e = document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window,
                     0, 0, 0, 0, 0, false, false, false,
                     false, 0, null);

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent("onclick");
  }
}





var emojiList;








// var element = document.getElementById('grid-snap'),
var unitSize = vm.cellHeight;
x = 0;
y = 0;





function dragMoveListener (event) {
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
  target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

interact('.drag-resize')
  .draggable({
    onmove: window.dragMoveListener,
    snap: {
      targets: [
        interact.createSnapGrid({ x: unitSize, y: unitSize, range:unitSize })
      ],
      // range: 50,
      relativePoints: [ { x: 0, y: 0 } ],
      endOnly: false
    },
    // inertia: true,
    restrict: {
      restriction: 'parent',
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
      endOnly: false
    }
  })
  .on('dragmove', function (event) {
    vm.currentContainer.dispatchEvent(new CustomEvent('move', {detail: [event.dx, event.dy]}));
    // console.log(event.dx);
    
    // console.log('dragging???');
    // if (vm.resizing) return;
    // if (event.dx > 0) console.log("BLAHSFKJLKF");

    x += event.dx;
    y += event.dy;


    event.target.style.webkitTransform =
    event.target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
  })
  // .on('dragstart dragend', function (event) {
  //   console.log('dragging????');
  // })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: false,
    },

    // minimum size
    restrictSize: {
      min: { width: unitSize, height: unitSize },
    },

    snap: {
      targets: [
        interact.createSnapGrid({ x: unitSize, y: unitSize, range:unitSize })
      ],
      // range: 50,
      relativePoints: [ { x: 0, y: 0 } ],
      endOnly: false
    }
  })
  .on('resizemove', function (event) {
    // console.log(event);
    vm.currentContainer.dispatchEvent(new CustomEvent('resize', {detail: event.deltaRect}));
    console.log(event);
    vm.dX = event.deltaRect.left;
    vm.dY = event.deltaRect.top;
    vm.dW = event.deltaRect.width;
    vm.dH = event.deltaRect.height;
    


    
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);
    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';
    
    
    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;
    
    // console.log(event.deltaRect.left);
    // console.log(vm.resizing);
    // console.log("resized" + x + " " + y);
    // console.log(x + ", " + y + target);
    // return;
    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';
    

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    // console.log(x);
    // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    vm.resizing = false;
    // console.log(x);
  })
  .on('resizeend', function (event) {
    // console.log(x);
  })
  
;



















