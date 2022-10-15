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