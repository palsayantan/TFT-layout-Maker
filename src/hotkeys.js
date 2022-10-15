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
