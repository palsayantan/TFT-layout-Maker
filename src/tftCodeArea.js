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