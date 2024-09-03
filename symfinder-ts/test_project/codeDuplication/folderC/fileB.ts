console.log("hello")

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


export function hello(): void{
    
}

export const aVar = 0;
export const keys = 2


console.log("hello")