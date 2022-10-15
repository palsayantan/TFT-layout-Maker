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