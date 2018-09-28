var vm = new Vue({
  el: '#app',
  data: {
      emojiList: [],
      canvasWidth: null,
      cellWidth: null,
  },

  mounted: function(){
      // this.canvasWidth = this.$refs.app.clientWidth * 0.9;
      // this.cellWidth = this.canvasWidth/6;
      // console.log(this.canvasWidth);

      var vm = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          emojiList = xhttp.responseText.split(' ');
          console.log(emojiList);
          vm.emojiList = emojiList;
        }
      };
      xhttp.open("GET", "emojis.txt", true);
      xhttp.send(); 
      
      
  }
})




var emojiList;







// var element = document.getElementById('grid-snap'),
x = 0, y = 0;

interact('.grid-snap')
  .draggable({
    snap: {
      targets: [
        interact.createSnapGrid({ x: 50, y: 50, range:30 })
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
    x += event.dx;
    y += event.dy;

    event.target.style.webkitTransform =
    event.target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: true,
    },

    // minimum size
    restrictSize: {
      min: { width: 100, height: 50 },
    },

    snap: {
      targets: [
        interact.createSnapGrid({ x: 50, y: 50, range:30 })
      ],
      // range: 50,
      relativePoints: [ { x: 0, y: 0 } ],
      endOnly: false
    }
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
  });