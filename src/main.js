"use strict"
let workarea;
const shapes = {
    Rect: 'rectangle',
    RectFilled: 'rectangleFilled',
    RoundRect: 'rectangleRounded',
    RoundRectFilled: 'rectangleRoundedFilled',
    Triangle: 'triangle',
    TriangleFilled: 'triangleFilled',
    CircleFilled: 'circleFilled',
    Circle: 'circle',
    HLine: 'horizontalLine',
    VLine: 'verticalLine',
    BottomTopLine: 'btLine',
    TopBottomLine: 'tbLine',
    TextString: 'text',
    Char: 'char',
    Bitmap: 'bitmap'
};

/* Starts the app by creating the workarea */
function startApp() {
    let width = window.innerWidth - 550;
    let height = window.innerHeight - 50;
    workarea = new Workarea(width, height);
    let fileSelector = document.querySelector('#file-input');
    fileSelector.onchange = e => {
        workarea.currentFile = URL.createObjectURL(e.target.files[0]);
        workarea.currentFileLocalPath = e.target.files[0].name;
        addShape(shapes.Bitmap);
    }
}

/* Adds a shape to the workarea. Shorthand for workarea.addShape(shape) */
function addShape(shapeType) {
    let newShape = shapesBuilder.createShape(shapeType);
    if(shapeType === shapes.Bitmap) return; // bitmaps are handled on callbacks when user selected a file
    workarea.addShape(newShape);
}

function addImage() {
    let fileSelector = document.querySelector('#file-input');
    fileSelector.click();
}

startApp();

