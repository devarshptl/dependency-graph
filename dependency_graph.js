const graph = document.createElement('div');
graph.id = 'rootgraph';
const graphStyle = graph.style;
graphStyle.height = 'fit-content';
graphStyle.width = 'fit-content';
graphStyle.position = 'relative';
graphStyle.background = 'transparent';

function getLength(x1, y1, x2, y2) {
    const xsquare = Math.pow(x2-x1, 2);
    const ysquare = Math.pow(y2-y1, 2);
    return Math.sqrt(xsquare + ysquare);
}

function getAngle(x1, y1, x2, y2) {
    const dy = y2-y1;
    const dx = x2-x1;
    return Math.atan2(dy,dx) * 180 / Math.PI;
}

function appendStyle(selector, prop, val) {
    var style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.addRule(selector, prop +": "+ val);
} 

function addNode(id, eid,text, type, xpos, ypos, size,color='', fontSize = 16) {
    const newElement = document.createElement('div');
    const newElementStyle = newElement.style;
    newElementStyle.height = `${type === 'table' ? 60 : size}px`;
    newElementStyle.width = `${type === 'table' ? 90 : size}px`;
    newElementStyle.border = '2px solid black';
    newElementStyle.display = 'flex';
    newElementStyle.justifyContent = 'center';
    newElementStyle.alignItems = 'center';
    newElementStyle.position = 'absolute';
    newElementStyle.margin = '0px';
    
    newElement.id = eid;
    const subtext = text.substring(0, 5) + '...' + text[text.length-1];
    newElement.title = text;
    if(text.length > 8){
        newElement.innerHTML = subtext;
    }
    else {
        newElement.innerHTML = text;
    }
    // table decoration
    if(type === 'table') {
        newElementStyle.backgroundColor = '#ffe9e0';
        newElementStyle.left = `${xpos- 15}px`;
        newElementStyle.top = `${ypos}px`;
    }
    if(type === 'query' ) {
        newElementStyle.borderRadius = `${size}px`;
        newElementStyle.backgroundColor = 'pink';
        newElementStyle.left = `${xpos}px`;
        newElementStyle.top = `${ypos}px`;
    }
    if( type === 'final_query'){
        newElementStyle.borderRadius = `${size}px`;
        newElementStyle.height = `${size + 15}px`;
        newElementStyle.width = `${size+15}px`;
        newElementStyle.left = `${xpos - 7.5}px`;
        newElementStyle.top = `${ypos - 7.5}px`;
        newElementStyle.backgroundColor = color;
    }
    document.getElementById(id).appendChild(newElement);
}


function drawArrow(id, s1, s2, size) {
    const spos1 = {
        x: document.getElementById(s1).offsetLeft + size/2,
        y: document.getElementById(s1).offsetTop + size/2
    }
    const spos2 = {
        x: document.getElementById(s2).offsetLeft + size/2,
        y: document.getElementById(s2).offsetTop + size/2
    }
    const angle = getAngle( spos1.x, spos1.y, spos2.x, spos2.y);
    const length = getLength ( spos1.x, spos1.y, spos2.x, spos2.y );
    const newLine = document.createElement('div');
    const newLineStyle = newLine.style;
    newLineStyle.width = `${length}px`;
    newLineStyle.height = `fit-content`;
    newLineStyle.transform = `rotate(${angle}deg)`;
    newLineStyle.position = 'absolute';
    newLineStyle.top = `${(spos1.y + Math.sin(angle * Math.PI / 180) * length / 2) - 3}px`;
    newLineStyle.left = `${(spos1.x - length / 2 * (1 - Math.cos(angle * Math.PI / 180))) + 5*Math.sin(angle*Math.PI/ 180)}px`;
    newLineStyle.display = 'flex';
    newLineStyle.justifyContent = 'center';

    const newDiv = document.createElement('hr');
    const newHr = document.createElement('hr');
    newHr.style.width = `100%`;
    newDiv.appendChild(newHr);
    const newDivStyle = newDiv.style;
    newDivStyle.width = `${length - size  - 10}px`;
    if( (angle > 65 && angle < 80) || (angle > 155 && angle < 180)){
        newDivStyle.width = `${length - size  - (size+10)*Math.sin(angle*Math.PI/ 180)}px`;
    }
    newDivStyle.border = 'none';
    newDivStyle.display = 'flex';
    newDivStyle.paddingRight = '3px';
    newLine.appendChild(newDiv);
    newDiv.className = 'caret';
    newDivStyle.marginTop = '0px';
    newDivStyle.marginBottom = '0px';
    appendStyle(".caret::after", "content", "'>'");
    appendStyle(".caret::after", "margin-left", "-4px");
    newLineStyle.zIndex = '-99';
    document.getElementById(id).appendChild(newLine);
}

function getAssociativeArray(levels) {
    let lv = [];
    let max = 0;
    levels.map((item) => {
        if(item[0] > max){
            max = item[0];
        }
    })
    levels.map((item) => {
        item[1].map((inneritem) => {
            lv[inneritem] = max - item[0];
        })
    })

    return lv;
}

class DependencyGraph { 

    constructor(id, size, root) {
        // this.size = size;
        // this.root = root;
        // this.link = link;
        let link = [];
        root.map((item) => {
            if(item.link[0] !== null){
                item.link.map((lk) => {
                    const linkage = {
                        's1': item.id,
                        's2': lk
                    }
                    link.push(linkage);
                })
            }
        })
        const levels = [];
        getLevels(root, levels);
        let lv = getAssociativeArray(levels);
        document.getElementById(id).appendChild(graph);
        drawDependencyGraph(root, link, size, lv);
    }
}

function drawDependencyGraph(root, link, size, levels) {
    const tempLevels = [];
    // for(var i=0; i<levels.length; i++){
    //     if(tempLevels.indexOf(levels[i].level) === -1){
    //         tempLevels.push(levels[i].level);
    //     }
    // }
    levels.map((item) => {
        if(tempLevels.indexOf(item) === -1){
            tempLevels.push(item);
        }
    })
    tempLevels.sort();
    console.log(levels);
    var maxWidth = 0;
    for(level in tempLevels){
        let nodes = [];
        for(var i=0; i<root.length; i++){
            if(levels[root[i].id] == level){
                nodes.push(root[i]);
            }
        }
        if(nodes.length > maxWidth) {
            maxWidth = nodes.length;
        }
    }
    maxWidth = size*maxWidth+size;
    for(level in tempLevels){
        let nodes = [];
        for(var i=0; i<root.length; i++){
            if(levels[root[i].id] == level){
                nodes.push(root[i]);
            }
        }
        nodes.sort( (root1, root2) => {
            if(root1.link >= root2.link){
                return 1;
            }
            if(root1.link < root2.link){
                return -1;
            }
        });
        let ct = maxWidth+size*15;
        let array = [];
        let len = nodes.length + 1;
        for(var i = 1; i< len; i++){
            array.push(ct*i/len)
        }
        nodes.map((item, key) => {
            var y = 10+(150*parseInt(levels[item.id]));
            var x = 5 + array[key];
            // if( key>0 && nodes[key].link > nodes[0].link) {
            //     x = 10+(array[key]) + 20*(nodes[key].link - nodes[0].link);
            // }
            if(level == tempLevels[tempLevels.length - 1]){
                addNode('rootgraph', item.id, item.text, item.shape, x, y, size,'#e26e6e')
            }
            else {
                addNode('rootgraph', item.id, item.text, item.shape, x, y, size);
            }
        })
    }
    link.map((item) => {
        drawArrow('rootgraph', item.s1.toString(), item.s2.toString(), size); 
    })
}

function getLevels(root, levels, endpoint=null, level=0) {
    var ids = [];
    root.map((item) => {
        if(item.link.indexOf(endpoint) !== -1){
            let fg = false;
            levels.map((lev) => {
                if(lev[1].indexOf(item.id) !== -1){
                    fg = true;
                }
            })
            if(!fg){
                ids.push(item.id);                
            }
        }
    });
    if(ids.length === 0){
        return;
    }
    ids.map((id) => {
        getLevels(root, levels, id, level+1);
    })
    levels.push([level, ids]);
}

