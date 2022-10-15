class ColorCalculator {
    constructor() {
        this.colorPicker = document.querySelector('#color-picker');
        this.bgColorPicker = document.querySelector('#bg-color-picker');
        this._transparentBgCb = document.querySelector('#transparent-bg-cb');
        this._defaultColorPicker = document.querySelector('#shape-default-color-input');
    }

    /* Converts the given color to RGB565. If no color is given it'll use the value of #color-picker */
    ToRgb565(color) {
        const input_color = color || this.colorPicker.value;

        const r = parseInt("0x" + input_color[1] + input_color[2]);
        const g = parseInt("0x" + input_color[3] + input_color[4]);
        const b = parseInt("0x" + input_color[5] + input_color[6]);

        let rgb565 = (((r & 0xf8) << 8) + ((g & 0xfc) << 3) + ((b & 0xf8) >> 3)).toString(16);

        //pad 0s
        while (rgb565.length < 4)
            rgb565 = "0" + rgb565;

        return "0x" + rgb565.toUpperCase();
    }

    /* Returns the value of #color-picker as RGB888 */
    ToRgb888() {
        const input_color = this.colorPicker.value.toString();
        return "#" + input_color.substring(1, 7);
    }

    /* Syncs the color pickers, i.e. sets the default color picker's value to the property panel's color picker */
    syncPickers() {
        this._defaultColorPicker.value = this.colorPicker.value;
    }
    
    /* Sets the color of #color-picker */
    setColor(color) {
        this.colorPicker.value = color;
    }
    
    getBackgroundColor() {
        this.bgColorPicker.disabled = this._transparentBgCb.checked;
        if(this._transparentBgCb.checked)
            return 'transparent';
        else return this.bgColorPicker.value;
    }
    
    setBackgroundColor(color){
        let colorIsTransparent = color === 'transparent';
        this._transparentBgCb.checked = colorIsTransparent
        this.bgColorPicker.value = colorIsTransparent ? '#ffffff' : color;
        this.bgColorPicker.disabled = this._transparentBgCb.checked;
    }
    
}

let colorCalc = new ColorCalculator();
class ShapesBuilder {
    constructor() {
        this._defaultColorPicker = document.querySelector('#shape-default-color-input');
        this._defaultStrokeWidth = 3;
        this._defaultTextSize = document.querySelector('#text-size');
        
    }

    createRectangleFilled(radius = 0) {
        const rect = new Konva.Rect({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            width: Math.round(workarea.grid.numPixelsX / 20) * workarea.grid.padding,
            height: Math.round(workarea.grid.numPixelsY / 20) * workarea.grid.padding,
            name: radius === 0 ? shapes.RectFilled : shapes.RoundRectFilled,
            tftCode: radius === 0
                ? function () {
                    return `tft.fillRect(${Math.round(this.x)},${Math.round(this.y)},${this.width},${this.height},${colorCalc.ToRgb565(this.color)});`
                }
                : function () {
                    return `tft.fillRoundRect(${Math.round(this.x)},${Math.round(this.y)},${this.width},${this.height},${this.cornerRadius},${colorCalc.ToRgb565(this.color)});`
                },
            color: this._defaultColorPicker.value,
            fill: this._defaultColorPicker.value,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x, 
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            cornerRadius: radius,
            strokeScaleEnabled: false,
        });
        setupShapeEvents(rect);
        return rect;
    }

    createRectangle(radius = 0) {
        const rect = new Konva.Rect({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            width: Math.round(workarea.grid.numPixelsX / 20) * workarea.grid.padding,
            height: Math.round(workarea.grid.numPixelsY / 20) * workarea.grid.padding,
            name: radius === 0 ? shapes.Rect : shapes.RoundRect,
            tftCode: radius === 0
                ? function () {
                    return `tft.drawRect(${Math.round(this.x)},${Math.round(this.y)},${this.width},${this.height},${colorCalc.ToRgb565(this.color)});`
                }
                : function () {
                    return `tft.drawRoundRect(${Math.round(this.x)},${Math.round(this.y)},${this.width},${this.height},${this.cornerRadius},${colorCalc.ToRgb565(this.color)});`
                },
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x, 
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            cornerRadius: radius,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            strokeScaleEnabled: false,
            stroke: this._defaultColorPicker.value,
            strokeWidth: this._defaultStrokeWidth,
            color: this._defaultColorPicker.value,
        });
        setupShapeEvents(rect);
        return rect;
    }

    createTriangleFilled() {
        let triangle = new Konva.Shape({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            width: 70,
            height: 70,
            sceneFunc: function (context, shape) {
                let height = shape.height();
                let width = shape.width();
                context.beginPath();
                context.moveTo(0, height);
                context.lineTo(width / 2, 0);
                context.lineTo(width, height);
                context.closePath();

                // (!) Konva specific method, it is very important
                context.fillStrokeShape(shape);
            },
            draggable: true,
            strokeScaleEnabled: false,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            name: shapes.TriangleFilled,
            color: this._defaultColorPicker.value,
            fill: this._defaultColorPicker.value,
            tftCode: function () {
                return `tft.fillTriangle(${Math.round(this.x)},${Math.round(this.y + this.height)},${Math.round(this.x + this.width / 2)},${Math.round(this.y)},${Math.round(this.x + this.width)},${Math.round(this.y + this.height)},${colorCalc.ToRgb565(this.color)});`
            },

        });
        triangle.getSelfRect = function () {
            return {
                x: 0,
                y: 0,
                width: triangle.width(),
                height: triangle.height()
            };
        }
        setupShapeEvents(triangle);
        return triangle;
    }

    createTriangle() {
        let triangle = new Konva.Shape({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            width: 70,
            height: 70,
            sceneFunc: function (context, shape) {
                let height = shape.height();
                let width = shape.width();
                context.beginPath();
                context.moveTo(0, height);
                context.lineTo(width / 2, 0);
                context.lineTo(width, height);
                context.closePath();

                // (!) Konva specific method, it is very important
                context.fillStrokeShape(shape);
            },
            draggable: true,
            strokeScaleEnabled: false,
            name: shapes.Triangle,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            color: this._defaultColorPicker.value,
            tftCode: function () {
                //x0,y0,x1,y1,x2,y2,color); 3 verticies
                return `tft.drawTriangle(${Math.round(this.x)},${Math.round(this.y + this.height)},${Math.round(this.x + this.width / 2)},${Math.round(this.y)},${Math.round(this.x + this.width)},${Math.round(this.y + this.height)},${colorCalc.ToRgb565(this.color)});`
            },
            strokeWidth: this._defaultStrokeWidth,
            stroke: this._defaultColorPicker.value,
        });
        triangle.getSelfRect = function () {
            return {
                x: 0,
                y: 0,
                width: triangle.width(),
                height: triangle.height()
            };
        }

        setupShapeEvents(triangle);
        return triangle;
    }

    createCircleFilled() {
        const circle = new Konva.Circle({
            x: workarea.grid.padding * 5,
            y: workarea.grid.padding * 5,
            radius: workarea.grid.padding * 4,
            name: shapes.CircleFilled,
            tftCode: function () {
                return `tft.fillCircle(${Math.round(this.x)},${Math.round(this.y)},${this.radius},${colorCalc.ToRgb565(this.color)});`
            },
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x,
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            strokeScaleEnabled: false,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            color: this._defaultColorPicker.value,
            fill: this._defaultColorPicker.value,
        });
        setupShapeEvents(circle);
        return circle;
    }

    createCircle() {
        const circle = new Konva.Circle({
            x: workarea.grid.padding * 5,
            y: workarea.grid.padding * 5,
            radius: workarea.grid.padding * 4,
            name: shapes.Circle,
            tftCode: function () {
                return `tft.drawCircle(${Math.round(this.x)},${Math.round(this.y)},${this.radius},${colorCalc.ToRgb565(this.color)});`
            },
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x,
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            strokeScaleEnabled: false,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            strokeWidth: this._defaultStrokeWidth,
            color: this._defaultColorPicker.value,
            stroke: this._defaultColorPicker.value,

        });
        setupShapeEvents(circle);
        return circle;
    }

    createHLine() {
        const line = new Konva.Line({
            points: [0, 0, workarea.grid.padding * 3, 0],
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            name: shapes.HLine,
            tftCode: function () {
                return `tft.drawFastHLine(${Math.round(this.x)},${Math.round(this.y)},${this.points[2] - this.points[0]},${colorCalc.ToRgb565(this.color)});`
            },
            color: this._defaultColorPicker.value,
            draggable: true,
            transformAnchors: ['middle-right', 'middle-left'],
            strokeWidth: this._defaultStrokeWidth,
            hitStrokeWidth: 10,
            stroke: this._defaultColorPicker.value,
            strokeScaleEnabled: false,
        });

        line.getSelfRect = function () {
            return {
                x: line.points()[0],
                y: line.points()[0] - 5,
                width: line.points()[2] - line.points()[0],
                height: 10
            };
        }

        setupShapeEvents(line);
        return line;
    }

    createVLine() {
        const line = new Konva.Line({
            points: [0, 0, 0, workarea.grid.padding * 3],
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            name: shapes.VLine,
            tftCode: function () {
                return `tft.drawFastVLine(${Math.round(this.x)},${Math.round(this.y)},${this.points[3] - this.points[1]},${colorCalc.ToRgb565(this.color)});`
            },
            color: this._defaultColorPicker.value,
            draggable: true,
            strokeWidth: this._defaultStrokeWidth,
            hitStrokeWidth: 10,
            stroke: this._defaultColorPicker.value,
            strokeScaleEnabled: false,
            transformAnchors: ['top-center', 'bottom-center']
        });

        line.getSelfRect = function () {
            return {
                x: line.points()[0] - 5,
                y: line.points()[0],
                width: 10,
                height: line.points()[3] - line.points()[1],
            };
        }

        setupShapeEvents(line);
        return line;
    }

    createLine(botToTop = false) {
        const line = new Konva.Line({
            points: botToTop
                ? [0, workarea.grid.padding * 2, workarea.grid.padding * 3, 0]
                : [0, 0, workarea.grid.padding * 3, workarea.grid.padding * 3],
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            name: botToTop ? shapes.BottomTopLine : shapes.TopBottomLine,
            tftCode: function () {
                return `tft.drawLine(${Math.round(this.x)},${Math.round(this.y + this.points[1])},${Math.round(this.x + this.points[2])},${Math.round(this.y + this.points[3])},${colorCalc.ToRgb565(this.color)});`
            },
            color: this._defaultColorPicker.value,
            draggable: true,
            transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            strokeWidth: this._defaultStrokeWidth,
            hitStrokeWidth: 10,
            stroke: this._defaultColorPicker.value,
            strokeScaleEnabled: false,
        });

        setupShapeEvents(line);
        return line;
    }
    
    createText() {
        let defaultTextSize = this._defaultTextSize;
        const text = new Konva.Text({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            name: shapes.TextString,
            tftCode: function () {
                return this.textSize === 'default' 
                    ?  `${this.printColor()}<br>tft.drawString("${this.text}",${Math.round(this.x)},${Math.round(this.y)});`
                    :  `${this.printColor()}<br>tft.drawString("${this.text}",${Math.round(this.x)},${Math.round(this.y)},${this.textSize});`
            },
            color: this._defaultColorPicker.value,
            backgroundColor: 'transparent',
            fill: this._defaultColorPicker.value,
            draggable: true,
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x,
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            text: 'New text',
            fontFamily: 'Freesans, Mono, Monospaced, Monospace, Monaco',
            letterSpacing: .2,
            fontSize: +defaultTextSize.value * 8,
            textSize: 'default',
            transformAnchors: ['top-center', 'bottom-center', 'middle-right', 'middle-left'],
            setTextSize: function(newSize) {
                this.textSize = newSize;
                this.fontSize = newSize === 'default' ? +defaultTextSize.value * 8 : +newSize * 8;
                this.width = this.textWidth;
                this.height = this.textHeight;
                // Hack to make bounding box update automatically
                this.text = this.text + ' ';
                workarea.batchDrawShapesLayer();
            },
            printColor() {
                return this.backgroundColor !== 'transparent'
                    ? `tft.setTextColor(${colorCalc.ToRgb565(this.color)},${colorCalc.ToRgb565(this.backgroundColor)});`
                    : `tft.setTextColor(${colorCalc.ToRgb565(this.color)});`
            }
        });
        setupShapeEvents(text);
        return text;
    }

    createChar() {
        let defaultTextSize = this._defaultTextSize;
        const text = new Konva.Text({
            x: workarea.grid.padding,
            y: workarea.grid.padding,
            name: shapes.Char,
            tftCode: function () {
                return this.textSize === 'default'
                    ?  `tft.drawChar(${Math.round(this.x)},${Math.round(this.y)},'${this.text}',${colorCalc.ToRgb565(this.color)},${colorCalc.ToRgb565(this.backgroundColor)},${+defaultTextSize.value});`
                    :  `tft.drawChar(${Math.round(this.x)},${Math.round(this.y)},'${this.text}',${colorCalc.ToRgb565(this.color)},${colorCalc.ToRgb565(this.backgroundColor)},${this.textSize});`
            },
            color: this._defaultColorPicker.value,
            backgroundColor: 'transparent',
            fill: this._defaultColorPicker.value,
            draggable: true,
            transformAnchors: ['top-center', 'bottom-center', 'middle-right', 'middle-left'],
            dragBoundFunc: function (pos) {
                return {
                    x: pos.x < 0 ? 0 : pos.x,
                    y: pos.y < 0 ? 0 : pos.y,
                };
            },
            text: 'A',
            fontFamily: 'Freesans, Mono, Monospaced, Monospace, Monaco',
            letterSpacing: .2,
            fontSize: +defaultTextSize.value * 8,
            textSize: 'default',
            setTextSize: function(newSize) {
                this.textSize = newSize;
                this.fontSize = newSize === 'default' ? +defaultTextSize.value * 8 : +newSize * 8;
                this.width = this.textWidth;
                this.height = this.textHeight;

                // Hack to make bounding box update automatically
                this.text = this.text + ' ';
                workarea.batchDrawShapesLayer();
            }
        });
        setupShapeEvents(text);
        return text;
    }

    createBitmap() {
        const filePath = workarea.currentFileLocalPath;
        // console.log(filePath);
        let img = new Image();
        img.src = workarea.currentFile;
        img.onload = function() {
            let konvaImg = new Konva.Image({
                image: img,
                x: workarea.grid.padding,
                y: workarea.grid.padding,
                name: shapes.Bitmap,
                draggable: true,
                transformAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
                localPath: filePath,
                tftCode: function() { 
                    return `drawBMP("/${this.localPath}",${this.x},${this.y});`;
                    },
                dragBoundFunc: function (pos) {
                    return {
                        x: pos.x < 0 ? 0 : pos.x,
                        y: pos.y < 0 ? 0 : pos.y,
                    };
                },

            });
            setupShapeEvents(konvaImg);

            workarea.addShape(konvaImg);
        }
    }


    createShape(shapeType) {
        switch (shapeType) {
            case shapes.RectFilled:
                return this.createRectangleFilled();

            case shapes.Rect:
                return this.createRectangle()

            case shapes.RoundRectFilled:
                return this.createRectangleFilled(10);

            case shapes.RoundRect:
                return this.createRectangle(10);

            case shapes.TriangleFilled:
                return this.createTriangleFilled();

            case shapes.Triangle:
                return this.createTriangle();

            case shapes.CircleFilled:
                return this.createCircleFilled();

            case shapes.Circle:
                return this.createCircle();

            case shapes.HLine:
                return this.createHLine();

            case shapes.VLine:
                return this.createVLine();

            case shapes.TopBottomLine:
                return this.createLine(false);

            case shapes.BottomTopLine:
                return this.createLine(true);
                
            case shapes.TextString:
                return this.createText();
                
            case shapes.Char:
                return this.createChar();
                
            case shapes.Bitmap:
                return this.createBitmap();

        }
    }
}

let shapesBuilder = new ShapesBuilder();
"use strict";

class Workarea {
    constructor(width, height) {
        Konva.pixelRatio = +document.querySelector('#quality-setting').value;
        this._zoomAmountLabel = document.querySelector('#zoom-amount');
        this._zoomLevel = 1;
        this.scrollSensitivity = 3;
        this._scrollSensitivityInput = document.querySelector('#scroll-sensitivity');
        let stage = new Konva.Stage({
            container: 'workspace',
            width: width,
            height: height,
            draggable: false,
        });
        this.currentFile = '';
        this._toggleDraggableButton = document.querySelector('#toggle-draggable-button');
        this.grid = new Grid();
        stage.add(this.grid.gridLayer);
        
        /* shadowrectangle is the preview that's displayed when transforming or moving a shape */
        this.shadowRectangle = new Konva.Rect({
            name: 'shadowRect',
            x: 0,
            y: 0,
            width: this.grid.padding * 2,
            height: this.grid.padding * 2,
            fill: '#FF7B17',
            opacity: 0.6,
            stroke: '#CF6412',
            strokeWidth: 3,
            dash: [20, 2]
        });
        this.transformer = new Konva.Transformer({
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
            ignoreStroke: true,
            keepRatio: false,
            name: 'shapesTransformer',
            rotateEnabled: false,
            setEnabledAnchorsFromShape: () => {
                if (transformer.nodes()[0].name() === shapes.HLine)
                    transformer.enabledAnchors(['middle-right', 'middle-left']);
                else if (transformer.nodes()[0].name() === shapes.VLine)
                    transformer.enabledAnchors(['top-center', 'bottom-center']);
                else if(transformer.nodes()[0].name() === shapes.TextString || transformer.nodes()[0].name() === shapes.Char)
                    transformer.enabledAnchors(['top-center', 'bottom-center', 'middle-right', 'middle-left']);
                else
                    transformer.enabledAnchors(['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']);
            },
            boundBoxFunc: function (oldBoundBox, newBoundBox) {
                // "boundBox" is an object with
                // x, y, width, height and rotation properties
                // transformer tool will try to fit nodes into that box
                // If new width or height is too small return previous state
                if (newBoundBox.width < workarea.grid.padding
                    || newBoundBox.height < workarea.grid.padding) {
                    return oldBoundBox;
                }

                return newBoundBox;
            },
        });
        this._shapesLayer = new Konva.Layer();
        this._shapesLayer.add(this.shadowRectangle);
        this._shapesLayer.add(this.transformer);
        this.shadowRectangle.hide();
        stage.add(this._shapesLayer);

        let transformer = this.transformer;
        let shapesLayer = this._shapesLayer;

        stage.on('click tap', function (e) {
            // if click on empty area - remove all selections
            if (e.target === stage || e.target.getLayer() !== shapesLayer) {
                transformer.nodes([]);
                propertyPanel.setProperties(null);
                return;
            }
            // do we pressed shift or ctrl?
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = transformer.nodes().indexOf(e.target) >= 0;

            if (!metaPressed && !isSelected) {
                // if no key pressed and the node is not selected
                // select just one
                transformer.nodes([e.target]);
                transformer.attrs.setEnabledAnchorsFromShape();
            } else if (metaPressed && isSelected) {
                // if we pressed keys and node was selected
                // we need to remove it from selection:
                const nodes = transformer.nodes().slice(); // use slice to have new copy of array
                // remove node from array
                nodes.splice(nodes.indexOf(e.target), 1);
                transformer.nodes(nodes);
            } else if (metaPressed && !isSelected) {
                // add the node into selection
                const nodes = transformer.nodes().concat([e.target]);
                transformer.nodes(nodes);
            }
        });


        this._totalZoomDelta = 0;
        stage.on('wheel', e => {
            // Delta is -1 for up-scroll and 1 for down scroll
            this._totalZoomDelta += Math.sign(e.evt.deltaY);
            if (this._totalZoomDelta < -workarea.scrollSensitivity) // scroll up
            {
                workarea.zoomIn();
                this._totalZoomDelta = 0;
            } else if (this._totalZoomDelta > workarea.scrollSensitivity) {
                workarea.zoomOut();
                this._totalZoomDelta = 0;
            }
        });
        this.stage = stage;
        this._fitGridToScreen();
    }

    setResolution() {
        let previousSizeX = this.grid.numPixelsX;
        let previousSizeY = this.grid.numPixelsY;
        this.grid.redraw();
        let factorX = this.grid.numPixelsX / previousSizeX;
        let factorY = this.grid.numPixelsY / previousSizeY;
        let shapes = this._shapesLayer.children;
        let numberOfShapes = shapes.length;
        for (let i = 0; i < numberOfShapes; i++) {
            let shape = shapes[i];
            if (shape.attrs.name === 'shadowRect' || shape.attrs.name === 'shapesTransformer') continue;
            shape.position({x: shape.x() * factorX, y: shape.y() * factorY});
            shape.size({width: shape.width() * factorX, height: shape.height() * factorY})
        }
        codeArea.setBaseValues();
        this.batchDrawShapesLayer();
        this._fitGridToScreen();
    }

    resizeGrid() {
        this.grid.redraw();
        codeArea.setBaseValues();
    }

    zoomIn() {
        this._zoomLevel += .25;
        this._applyZoom(this._zoomLevel);
    }

    zoomOut() {
        this._zoomLevel -= .25;
        if (this._zoomLevel < .5)
            this._zoomLevel = .5;
        this._applyZoom(this._zoomLevel);
    }

    _applyZoom(zoomLevel) {
        this._zoomAmountLabel.innerHTML = `${zoomLevel * 100}%`;
        this.stage.scale({
            x: zoomLevel,
            y: zoomLevel,
        });
    }

    addShape(shape) {
        this._shapesLayer.add(shape);
        this.transformer.nodes([shape]);
        this.transformer.attrs.setEnabledAnchorsFromShape();
        propertyPanel.setProperties(shape);
        codeArea.addShape(shape);
    }

    batchDrawShapesLayer() {
        this._shapesLayer.batchDraw();
    }

    toggleWorkareaDraggable() {
        let activeClass = 'c-move-workspace-button--active';
        if (this._toggleDraggableButton.classList.contains(activeClass)) {
            this._toggleDraggableButton.classList.remove(activeClass);
            this.stage.draggable(false);
        } else {
            this._toggleDraggableButton.classList.add(activeClass);
            this.stage.draggable(true);
        }
    }

    copyCurrentNode() {
        if (this._noShapeSelected()) return;
        this._copiedShape = this.transformer.nodes()[0];
    }

    pasteCopiedNode() {
        if (this._copiedShape === undefined) return;
        let copy = shapesBuilder.createShape(this._copiedShape.name());
        copy.size(this._copiedShape.size());
        copy.stroke(this._copiedShape.stroke());
        copy.fill(this._copiedShape.fill());
        if(copy.name() === shapes.Char || copy.name() === shapes.TextString)
            copy.text(this._copiedShape.text());
        copy.attrs.textSize = this._copiedShape.attrs.textSize;
        copy.attrs.color = this._copiedShape.attrs.color;
        copy.attrs.backgroundColor = this._copiedShape.attrs.backgroundColor;
        this.addShape(copy);
    }

    deleteSelectedNodes() {
        let selectedItems = this.transformer.nodes();
        this.transformer.nodes().forEach(x => x.destroy());
        this.transformer.nodes([]);
        codeArea.deleteShapes(selectedItems);
    }

    _noShapeSelected() {
        return this.transformer.nodes().length === 0;
    }

    _fitGridToScreen() {
        let scaleFactorX = this.stage.width() / this.grid.numPixelsX;
        let scaleFactorY = this.stage.height() / this.grid.numPixelsY;
        let scaleFactor = Math.min(scaleFactorX, scaleFactorY);
        scaleFactor -= (scaleFactor % .25);
        this._zoomLevel = scaleFactor;
        this._applyZoom(this._zoomLevel);
    }

    setScrollSensitivity() {
        this.scrollSensitivity = +this._scrollSensitivityInput.value;
    }

    setQuality() {
        Konva.pixelRatio = +document.querySelector('#quality-setting').value;
        this.resizeGrid();
    }
}
document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
        workarea.transformer.nodes([]);
    }
    if (ev.key === 'c' && (ev.ctrlKey || ev.metaKey)) {
        workarea.copyCurrentNode();
    }
    if (ev.key === 'v' && (ev.ctrlKey || ev.metaKey)) {
        workarea.pasteCopiedNode();
    }
    if (ev.key === 'Delete') {
        workarea.deleteSelectedNodes();
    }
});

"use strict";

const menuItems = {
    Workspace: "workspace",
    Shapes: "shapes",
    ShapeProperties: "shapeProps",
    Export: "export",
    Settings: "settings"
};

let menuDivs = document.getElementsByClassName('c-tools-foldout__item');
let menuButtons = document.getElementsByClassName('c-tools-panel__button');
function showMenu(menuItem)
{
    switch(menuItem)
    {
        case menuItems.Workspace:
            _enableMenuByIndex(0);
            break;
        case menuItems.Shapes:
            _enableMenuByIndex(1);
            break;
        case menuItems.ShapeProperties:
            _enableMenuByIndex(2);
            break;
        case menuItems.Settings:
            _enableMenuByIndex(3);
            break;
    }
    
    function _enableMenuByIndex(index)
    {
        for(let i = 0; i < menuDivs.length; i++)
        {
            if(i === index)
            {
                menuDivs[i].style.display = "block";
                menuButtons[i].classList.add('c-tools-panel__button--active');
            }
            else
            {
                menuDivs[i].style.display = "none";
                menuButtons[i].classList.remove('c-tools-panel__button--active');
            }
        }
    }
}
"use strict";

class Grid {
    constructor() {
        this._lineColor = '#888';
        this._heightInput = document.getElementById("height-input");
        this._widthInput = document.getElementById("width-input");
        this._paddingInput = document.getElementById("grid-size-input");
        this._screenSizeLabel = document.querySelector('#screen-size-label');
        let gridLayer = new Konva.Layer({draggable: false, name: 'grid'});
        this._createGrid(gridLayer);
        this.gridLayer = gridLayer;
    }

    /* Creates the grid on the given layer */
    _createGrid(gridLayer) {

        this.numPixelsX = +this._heightInput.value;
        this.numPixelsY = +this._widthInput.value;
        this.padding = +this._paddingInput.value;
        let numberOfColumns = Math.floor(this.numPixelsX / this.padding);
        let numberOfRows = Math.floor(this.numPixelsY / this.padding);

        let lineHeight = (numberOfRows * this.padding);//workspaceHeight;
        let lineWidth = (numberOfColumns * this.padding); //workspaceWidth;
        
        if(this.padding ===1)
        {
            // just draw bounds as a 1px big grid is unperformant
            gridLayer.add(new Konva.Line({
                points: [0, 0, 0, lineHeight],
                stroke: this._lineColor,
                strokeWidth: .5,
            }));
            gridLayer.add(new Konva.Line({
                points: [this.numPixelsX, 0, this.numPixelsX, lineHeight],
                stroke: this._lineColor,
                strokeWidth: .5,
            }));
            gridLayer.add(new Konva.Line({
                points: [0, 0, lineWidth, 0],
                stroke: this._lineColor,
                strokeWidth: 0.5,
            }));
            gridLayer.add(new Konva.Line({
                points: [0, lineHeight, lineWidth, lineHeight],
                stroke: this._lineColor,
                strokeWidth: 0.5,
            }));
            gridLayer.cache();
            return;
        }
        
        for (let x = 0; x <= numberOfColumns; x++) {
            gridLayer.add(new Konva.Line({
                points: [Math.round(x * this.padding), 0, Math.round(x * this.padding), lineHeight],
                stroke: this._lineColor,
                strokeWidth: .1,
            }));
        }

        for (let y = 0; y <= numberOfRows; y++) {
            gridLayer.add(new Konva.Line({
                points: [0, Math.round(y * this.padding), lineWidth, Math.round(y * this.padding)],
                stroke: this._lineColor,
                strokeWidth: .1,
            }));
        }
        gridLayer.cache();
        this._screenSizeLabel.innerHTML = `Display size: ${this.numPixelsX}x${this.numPixelsY}`;
    }

    /* Redraws the grid by destroying it and repainting all cells */
    redraw() {
        this.gridLayer.destroyChildren();
        this.gridLayer.clear();
        this._createGrid(this.gridLayer);
        this.gridLayer.batchDraw();
    }
}
"use strict";

class PropertyPanel {
    constructor() {
        this._xPosLabels = [].slice.call(document.querySelectorAll('.x-pos-label'));
        this._yPosLabels = [].slice.call(document.querySelectorAll('.y-pos-label'));
        this._widthLabels = [].slice.call(document.querySelectorAll('.x-size-label'));
        this._heightLabels = [].slice.call(document.querySelectorAll('.y-size-label'));
        this._radiusLabels = [].slice.call(document.querySelectorAll('.radius-label'));
        this._tftCodeLabels = [].slice.call(document.querySelectorAll('.tft-code'));
        this._xPosInput = document.querySelector('#x-pos-input');
        this._yPosInput = document.querySelector('#y-pos-input');
        this._widthInput = document.querySelector('#x-size-input');
        this._heightInput = document.querySelector('#y-size-input');
        this._radiusInput = document.querySelector('#radius-input');
        this._textInput = document.querySelector('#text-input');
        this._textToolsDiv = document.querySelector('.c-text-tools')
        this._textSizeOverrideInput = document.querySelector('#text-size-override');
        this._xPosInput.onkeydown = this._applyChanges;
        this._yPosInput.onkeydown = this._applyChanges;
        this._widthInput.onkeydown = this._applyChanges;
        this._heightInput.onkeydown = this._applyChanges;
        this._radiusInput.onkeydown = this._applyChanges;
        this._inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
    }

    /* Sets all properties in the panel from values of the given shape */
    setProperties(shape) {
        if (shape === null) {
            this._setElements();
            this._textToolsDiv.style = 'display: none';
            return;
        }
        let radius;
        if (shape.name().includes('circle'))
            radius = Math.round(shape.radius());
        if (shape.name().includes('Round'))
            radius = Math.round(shape.cornerRadius());
        let xPos = Math.round(shape.x());
        let yPos = Math.round(shape.y());
        let width = Math.round(shape.width() * shape.scaleX());
        let height = Math.round(shape.height() * shape.scaleY());
        if (shape.name().includes(shapes.TextString) || shape.name().includes(shapes.Char)) {
            this._textToolsDiv.style = 'display: flex';
            this._textInput.value = shape.text();
            this._textSizeOverrideInput.value = shape.attrs.textSize;
            colorCalc.setBackgroundColor(shape.attrs.backgroundColor);
        } else
            this._textToolsDiv.style = 'display: none';
        let tftCode = shape.attrs.tftCode();
        if(shape.name() === shapes.TextString)
            tftCode = tftCode.slice(tftCode.indexOf(">") + 1);
        this._setElements(xPos, yPos, width, height, radius, shape.attrs.color, tftCode);
    }

    /* Updates the propertypanel with values from the currently selected shape */
    updateSelectedShape() {
        let selectedItems = workarea.transformer.nodes().length;
        if (selectedItems !== 1) return;
        let selectedShape = workarea.transformer.nodes()[0];

        this._validateInputs();

        selectedShape.position({x: +this._xPosInput.value, y: +this._yPosInput.value});
        selectedShape.size({width: +this._widthInput.value, height: +this._heightInput.value})

        if (selectedShape.name().includes(shapes.TextString))
        {
            selectedShape.attrs.setTextSize(this._textSizeOverrideInput.value);
            selectedShape.text(this._textInput.value);
        }
        if(selectedShape.name().includes(shapes.Char))
        {
            selectedShape.attrs.setTextSize(this._textSizeOverrideInput.value);
            if(this._textInput.value.length > 1)
                this._textInput.value = this._textInput.value.charAt(1);
            selectedShape.text(this._textInput.value);
        }
        if (selectedShape.name().includes('circle'))
            selectedShape.radius(+this._radiusInput.value);
        if (selectedShape.name().includes('Round'))
            selectedShape.cornerRadius(+this._radiusInput.value);

        colorCalc.syncPickers();
        if (selectedShape.name().includes("Fill") || selectedShape.name().includes("text") || selectedShape.name().includes("char"))
            selectedShape.fill(colorCalc.ToRgb888());
        else
            selectedShape.stroke(colorCalc.ToRgb888());

        selectedShape.attrs.color = colorCalc.ToRgb888();
        if(selectedShape.name().includes("text") || selectedShape.name().includes("char"))
            selectedShape.attrs.backgroundColor = colorCalc.getBackgroundColor()
        
        this.setProperties(selectedShape);
        codeArea.updateShape(selectedShape);

    }

    /* Removes the currently selected shape */
    removeSelectedShape() {
        let selectedShape = workarea.transformer.nodes()[0];
        selectedShape.destroy();
        workarea.transformer.nodes([]);
        this._setElements();
    }

    _applyChanges(e) {
        if (e.key === 'Enter')
            propertyPanel.updateSelectedShape();
    }
    
    _setElements(x = 0, y = 0, width = 0, height = 0, radius = 0, color = '', tftCode = '') {
        this._xPosLabels.forEach(e => this._setElement(e, 'Pos x: ', x));
        this._yPosLabels.forEach(e => this._setElement(e, 'Pos y: ', y));
        this._widthLabels.forEach(e => this._setElement(e, 'Width: ', width));
        this._heightLabels.forEach(e => this._setElement(e, 'Height: ', height));
        if (radius > 0)
            this._radiusLabels.forEach(e => this._setElement(e, 'Radius: ', radius));
        this._radiusLabels.forEach(e => e.parentNode.style = radius > 0 ? 'display: block' : 'display: none');
        this._tftCodeLabels.forEach(e => e.innerHTML = tftCode);
        colorCalc.setColor(color);
    }

    _setElement(element, labelText, text) {
        if (this._isTextBox(element))
            element.value = text;
        else element.innerHTML = labelText + text;
    }

    _isTextBox(element) {
        let tagName = element.tagName.toLowerCase();
        if (tagName === 'textarea') return true;
        if (tagName !== 'input') return false;
        let type = element.getAttribute('type').toLowerCase();
        // if any of these input types is not supported by a browser, it will behave as input type text.
        return this._inputTypes.indexOf(type) >= 0;
    }

    _validateInputs() {
        let minValue = workarea.grid.padding;
        this._widthInput.value = +this._widthInput.value < minValue ? minValue : this._widthInput.value;
        this._heightInput.value = +this._heightInput.value < minValue ? minValue : this._heightInput.value;
        this._radiusInput.value = +this._radiusInput.value < minValue ? minValue : this._radiusInput.value;
    }
}
let propertyPanel = new PropertyPanel();

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


function setupShapeEvents(shape)
{
    shape.on('click tap', (e) => {
        propertyPanel.setProperties(shape);
        let isCircle = shape.name().includes('circle');
        workarea.transformer.keepRatio(isCircle);
        workarea.transformer.centeredScaling(isCircle);
        workarea.transformer.moveToTop();
    });
    shape.on('dragstart', (e) => {
        propertyPanel.setProperties(shape);
        workarea.batchDrawShapesLayer();

        if(workarea.grid.padding === 1 || shape.name().includes('Line'))
            return;
        workarea.shadowRectangle.setSize(shape.getSize());
        workarea.shadowRectangle.show();
        workarea.shadowRectangle.moveToTop();
    });
    shape.on('dragend', (e) => {
        shape.position({
            x: Math.round(shape.x() / workarea.grid.padding) * workarea.grid.padding,
            y: Math.round(shape.y() / workarea.grid.padding) * workarea.grid.padding
        });
        propertyPanel.setProperties(shape);
        workarea.batchDrawShapesLayer();
        if(workarea.grid.padding === 1)
            return;

        workarea.shadowRectangle.hide();
        codeArea.updateShape(shape);
    });
    shape.on('dragmove', (e) => {
        propertyPanel.setProperties(shape);
        if(workarea.grid.padding === 1)
            return;
        _setShadowRectPos(shape);
        workarea.batchDrawShapesLayer();
    });
    shape.on('transformstart', function() {
        workarea.transformer.moveToTop();
        if(workarea.grid.padding === 1 || shape.name().includes('Line'))
            return;
        let isCircle = shape.name().includes('circle');
        if(isCircle)
            return;
        workarea.shadowRectangle.setSize(shape.getSize());
        _setShadowRectPos(shape);
        workarea.batchDrawShapesLayer();
        workarea.shadowRectangle.show();
        workarea.shadowRectangle.moveToTop();
    });

    shape.on('transform', function () {
        propertyPanel.setProperties(shape);
        let isCircle = shape.name().includes('circle');
        if(shape.name().includes(shapes.TextString) || shape.name().includes(shapes.Char))
        {
            shape.setAttrs({
                width: shape.width() * shape.scaleX(),
                height: shape.height() * shape.scaleY(),
                scaleX: 1,
                scaleY: 1,
            });
        }
        if(workarea.grid.padding === 1 || isCircle)
            return;
        let width = shape.width() * shape.scaleX();
        let height = shape.height() * shape.scaleY();
        let snappedWidth = Math.round(width / workarea.grid.padding) * workarea.grid.padding;
        let snappedHeight = Math.round(height / workarea.grid.padding) * workarea.grid.padding;
        workarea.shadowRectangle.setSize({width: snappedWidth, height: snappedHeight});
        _setShadowRectPos(shape);
        workarea.batchDrawShapesLayer();
        

    });
    shape.on('transformend', function () {
        let width = shape.width() * shape.scaleX();
        let height = shape.height() * shape.scaleY();
        if(shape.name().includes('circle'))
        {
            shape.radius(Math.round((width/2) / workarea.grid.padding) * workarea.grid.padding);
            shape.scaleY(1);
            shape.scaleX(1);
        }
        else if(shape.name().includes(shapes.HLine))
        {
            shape.scaleY(1);
            shape.scaleX(1);
            // Set all since else the transformer doesn't pick up the new size
            shape.points([shape.points()[0], shape.points()[1], Math.round(width/workarea.grid.padding) * workarea.grid.padding, shape.points()[3]]);
        }
        else if(shape.name().includes(shapes.VLine))
        {
            shape.scaleY(1);
            shape.scaleX(1);
            // Set all since else the transformer doesn't pick up the new size
            shape.points([shape.points()[0], shape.points()[1], shape.points()[2], Math.round(height/workarea.grid.padding) * workarea.grid.padding]);
        }
        else if(shape.name() === shapes.TopBottomLine)
        {
            shape.scaleY(1);
            shape.scaleX(1);
            shape.position({
                x: Math.round(shape.x() / workarea.grid.padding) * workarea.grid.padding,
                y: Math.round(shape.y() / workarea.grid.padding) * workarea.grid.padding
            });
            shape.points([shape.points()[0], shape.points()[1], Math.round(width/workarea.grid.padding) * workarea.grid.padding, Math.round(height/workarea.grid.padding) * workarea.grid.padding]);
        }
        else if(shape.name() === shapes.BottomTopLine)
        {
            shape.scaleY(1);
            shape.scaleX(1);
            shape.position({
                x: Math.round(shape.x() / workarea.grid.padding) * workarea.grid.padding,
                y: Math.round(shape.y() / workarea.grid.padding) * workarea.grid.padding
            });
            shape.points([shape.points()[0], Math.round(height/workarea.grid.padding) * workarea.grid.padding, Math.round(width/workarea.grid.padding) * workarea.grid.padding, shape.points()[3]]);
        }
        else {
            shape.width(Math.round(width/workarea.grid.padding) * workarea.grid.padding);
            shape.height(Math.round(height/workarea.grid.padding) * workarea.grid.padding);
            shape.scaleY(1);
            shape.scaleX(1);
            shape.position({
                x: Math.round(shape.x() / workarea.grid.padding) * workarea.grid.padding,
                y: Math.round(shape.y() / workarea.grid.padding) * workarea.grid.padding
            });
        }
        propertyPanel.setProperties(shape);
        workarea.shadowRectangle.hide();
        codeArea.updateShape(shape);
    });
}


function _setShadowRectPos(shape)
{
    if(shape.attrs.name.includes("circle"))
    {
        workarea.shadowRectangle.position({
            x: Math.round((shape.x() - shape.radius()) / workarea.grid.padding) * workarea.grid.padding,
            y: Math.round((shape.y() - shape.radius()) / workarea.grid.padding) * workarea.grid.padding
        });
    }
    else
    {
        workarea.shadowRectangle.position({
            x: Math.round(shape.x() / workarea.grid.padding) * workarea.grid.padding,
            y: Math.round(shape.y() / workarea.grid.padding) * workarea.grid.padding
        });
    }
}
class TftCodeArea {
    constructor() {
        this._elements = {};
        this._elementsIndexMap = {};
        this._curShapeIndex = 0;
        this._rotateInput = document.querySelector('#rotate-select');
        this._textSizeInput = document.querySelector('#text-size');
        this._settingsArea = document.querySelector('#settings-output-area');
        this._shapesArea = document.querySelector('#shapes-output-area');

        this.setBaseValues();
        this._lastTextColor = undefined;
    }

    /* Changes all texts with default size to the newly selected size, then clears and sets all base values */
    setDefaultTextSize() {
        let texts = workarea.stage.find('.' + shapes.TextString);
        for (let i = 0; i < texts.length; i++) {
            texts[i].attrs.setTextSize('default');
        }
        texts = workarea.stage.find('.' + shapes.Char);
        for (let i = 0; i < texts.length; i++) {
            texts[i].attrs.setTextSize('default');
        }

        this.setBaseValues();
    }

    /* Clears and sets all the base values for the output, i.e. everything that's not related to shapes. */
    setBaseValues() {
        while (this._settingsArea.firstChild)
            this._settingsArea.removeChild(this._settingsArea.firstChild);

        this._settingsArea.appendChild(this._createNode('#define TFT_HEIGHT ' + workarea.grid.numPixelsY + ';'));
        this._settingsArea.appendChild(this._createNode('#define TFT_WIDTH ' + workarea.grid.numPixelsX + ';'));
        this._settingsArea.appendChild(this._createNode('&nbsp;'));
        this._settingsArea.appendChild(this._createNode('tft.init();'));
        this._settingsArea.appendChild(this._createNode(`tft.setRotation(${+this._rotateInput.value});`));
        this._settingsArea.appendChild(this._createNode(`tft.setTextSize(${+this._textSizeInput.value});`));
        this._settingsArea.appendChild(this._createNode('tft.fillScreen(0x0000);'));
        this._settingsArea.appendChild(this._createNode('&nbsp;'));
    }

    /* Creates a html-node with the given text */
    _createNode(text) {
        let element = document.createElement("span");
        element.classList.add('code-element')
        element.innerHTML = text;
        return element;
    }

    /* Adds the TFT-code of the given shape to the code-area */
    addShape(shape) {
        this._elements[shape._id] = shape;
        this._elementsIndexMap[shape._id] = this._getIndexForNewShape();
        let codeToAdd = shape.attrs.tftCode();
        if (shape.name() === shapes.TextString) {
            let prevText = this._getPreviousTextElement(shape._id);
            if (prevText !== null) {
                let lastColorUsed = prevText.attrs.color;
                let lastBgColorUsed = prevText.attrs.backgroundColor;
                if (lastColorUsed === shape.attrs.color && lastBgColorUsed === shape.attrs.backgroundColor) {
                    codeToAdd = codeToAdd.slice(codeToAdd.indexOf(">") + 1);
                }
            }
        }
        this._shapesArea.appendChild(this._createNode(codeToAdd));
    }

    /* Updates the TFT-code of the given shape in the code-area */
    updateShape(shape) {
        let index = this._elementsIndexMap[shape._id];
        this._elements[shape._id] = shape;
        let newCode = shape.attrs.tftCode();
        if (shape.name() === shapes.TextString) {
            // If it's a text just regenerate all code instead of fiddling with checking
            // if previous/next text should have it's color printed
            this.deleteShapes(null);
            let prevText = this._getPreviousTextElement(shape._id);
            if (prevText !== null) {
                let lastColorUsed = prevText.attrs.color;
                let lastBgColorUsed = prevText.attrs.backgroundColor;
                if (lastColorUsed === shape.attrs.color && lastBgColorUsed === shape.attrs.backgroundColor) {
                    newCode = newCode.slice(newCode.indexOf(">") + 1);
                }
            }

        }
        this._shapesArea.children[index].innerHTML = newCode;
    }

    /* Gets and increment the current shape index */
    _getIndexForNewShape() {
        this._curShapeIndex++;
        return this._curShapeIndex - 1;
    }

    /* Deletes the code for the given shapes from the code-area */
    deleteShapes(deletedItems) {
        if(deletedItems !== null)
        {
            let removedIndexes = deletedItems.map(x => x._id);//attrs.outputListIndex);
            for (let i = 0; i < removedIndexes.length; i++)
                delete this._elements[removedIndexes[i]];
        }
        this._curShapeIndex = 0;
        this._elementsIndexMap = {};
        while (this._shapesArea.firstChild)
            this._shapesArea.removeChild(this._shapesArea.firstChild);

        for (let k in this._elements)
            this.addShape(this._elements[k]);
    }

    /* Copies all code to clipboard */
    copyAll() {
        let codeString = '';
        this._settingsArea.childNodes.forEach(n => codeString += n.innerHTML === '&nbsp;' ? '\r\n' : n.innerHTML + '\r\n');
        this._shapesArea.childNodes.forEach(n => codeString += n.innerHTML + '\r\n');
        codeString = codeString.replaceAll("<br>", "\r\n");
        this._copyStringToClipboard(codeString);
    }

    /* Copies the given string to the clipboard by adding it to an invisible element and selecting all text */
    _copyStringToClipboard(str) {
        let el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("Copied to clipboard: \r\n" + str);
    }

    _getPreviousTextElement(shapeId) {
        let prevElement = null;
        for (let i in this._elementsIndexMap) {
            // If i is the same as shapeId then we've reached the current element.
            // Return the previous we've found
            if (+i === +shapeId) {
                return prevElement;
            }
            let element = this._elements[i];
            if (element.name() === shapes.TextString) {
                prevElement = element;
            }
        }
        return null;
    }
}


let codeArea = new TftCodeArea();