export function detectCodeClone(): void{
    var nodes: any[] = this.neoGraph.getVariantFiles();
    var groupedNode: any[] = [];
    for(let node of nodes){
        if(groupedNode[node.properties.name] === undefined){
            groupedNode[node.properties.name] = [node]
        }
        else{
            groupedNode[node.properties.name].push(node)
        }
    }

    for(let [key, value] of Object.entries(groupedNode)){
        console.log(value[0].properties.path)
    }

    
}


const bVar = 0;

export{
    bVar as aVar
}