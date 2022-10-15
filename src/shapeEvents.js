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