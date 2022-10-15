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
