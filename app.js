function init() {
    
    let flow1 = new PressureDropController("flow1");

    //let span = document.createElement('span');
    //let body = document.getElementsByTagName("body");
    //span.setAttribute("id", "flowTable");
    //body[0].appendChild(span);

    createAndInsertFlowTable(flow1, 'flowTable', ['label', 'user', 'units', 'method']);
    flow1.updateHTML();
    flow1.eventHandler();
}