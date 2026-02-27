function init() {
    
    let flow1 = new PressureDropController("flow1");
    let flow2 = new PressureDropController("flow2");

    //let span = document.createElement('span');
    //let body = document.getElementsByTagName("body");
    //span.setAttribute("id", "flowTable");
    //body[0].appendChild(span);

    createAndInsertFlowTable(flow1, 'flow1', ['label', 'user', 'units', 'method'], "","");
    flow1.updateHTML();
    flow1.eventHandler();

    createAndInsertFlowTable(flow2, 'flow2', ['label', 'user', 'units', 'method'], "","");
    flow2.updateHTML();
    flow2.eventHandler();
}