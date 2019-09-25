
var rendererData = {
  textboxList: [
    { // EMPTY TEXTBOX
      id: 'textbox-1',
      isEditable: true,
      verticalAlign: 'BOTTOM',
      paddingX: 5,// % textboxWidth ( 0 <> (100-charwidth)/2 )
      paddingY: 5,
      cursor: null,
      uniforms: {
        u_mouse: [0, 0],
      },
      lineList: [
        { // Line
          inlineAlign: 'TOP',
          horizontalAlign: 'LEFT',
          wrapLine: true,
          charList: [
            { // Char
              letter: 'A',
              style: {
                font: 'test-font',
                size: 20,
                leading: 1.2,
                tracking: 0,
              },
              // position: {
                // sublineIndex
                // sublineY
                // sublineHeight
                // charX
                // charY
                // charHeight
                // charWidth
              // },
              // renderInfo: {
                // bufferInfo,
                // programInfo,
                // uniforms,
              // }
            },
            { // Char
              letter: 'A',
              style: {
                font: 'test-font',
                size: 20,
                leading: 1.2,
                tracking: 0,
              },
            },
            { // Char
              letter: 'A',
              style: {
                font: 'test-font',
                size: 20,
                leading: 1.2,
                tracking: 0,
              },
            },
          ]
        }
      ]
    },
  ],
};
