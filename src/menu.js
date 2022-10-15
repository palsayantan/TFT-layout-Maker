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