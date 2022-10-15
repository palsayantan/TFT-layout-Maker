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