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